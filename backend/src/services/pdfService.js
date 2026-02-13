import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export const PdfService = {
    /**
     * Generates a professional PDF certificate for a property
     * @param {Object} property - Property data from blockchain/db
     * @param {String} qrUrl - Dynamic verification URL for the QR code
     * @returns {Promise<Buffer>} - The generated PDF buffer
     */
    async generateCertificate(property, qrUrl) {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margin: 0, // Need 0 margin for full-width header, we'll adds margins manually
                });

                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(buffers);
                    resolve(pdfBuffer);
                });

                // --- Design System ---
                const LabelGray = '#A0AEC0'; // slate-400
                const TextBlack = '#000000';
                const MintGreen = '#10B981';
                const LedgerBlue = '#EFF6FF';
                const LedgerText = '#2563EB';
                const VaultNavy = '#020617'; // slate-950
                const CyanAccent = '#22D3EE'; // cyan-400

                // 1. TOP HEADER (Vault Design)
                const headerHeight = 220;
                doc.rect(0, 0, doc.page.width, headerHeight).fill(VaultNavy);

                // Header Glass Decoration
                doc.save();
                doc.opacity(0.1);
                doc.rect(20, 20, doc.page.width - 40, headerHeight - 40).strokeColor('white').lineWidth(1).stroke();
                doc.restore();

                // Logo Placeholder / Actual Logo
                const logoPath = path.join(process.cwd(), '..', 'logo.png');
                const cx = doc.page.width / 2;

                try {
                    if (fs.existsSync(logoPath)) {
                        doc.image(logoPath, cx - 40, 30, { width: 80 });
                    } else {
                        // Fallback to circle if logo missing
                        doc.circle(cx, 60, 35).fill('white');
                        doc.fillColor(VaultNavy).fontSize(30).text('🏛️', cx - 15, 48);
                    }
                } catch (e) {
                    doc.circle(cx, 60, 35).fill('white');
                    doc.fillColor(VaultNavy).fontSize(30).text('🏛️', cx - 15, 48);
                }

                // Branding Text
                doc.fillColor(CyanAccent).fontSize(8).font('Helvetica-Bold').text('BLOCKCHAIN  REAL  ESTATE  AUTHORITY', 0, 115, { align: 'center', characterSpacing: 2 });
                doc.fillColor('white').fontSize(38).font('Helvetica-BoldOblique').text('DEED OF OWNERSHIP', 0, 138, { align: 'center', characterSpacing: 1 });

                // Sub-Branding with lines
                doc.lineWidth(0.5).strokeColor('white').opacity(0.3);
                doc.moveTo(cx - 150, 200).lineTo(cx - 50, 200).stroke();
                doc.moveTo(cx + 50, 200).lineTo(cx + 150, 200).stroke();
                doc.opacity(1.0).fillColor('white').fontSize(8).font('Helvetica-Bold').text('IMMUTABLE DIGITAL IDENTITY', 0, 196, { align: 'center', characterSpacing: 3 });

                // 2. Large SECURE Watermark (BACKGROUND LAYER)
                doc.save();
                doc.fillColor('#F8FAFC');
                doc.fontSize(220).font('Helvetica-Bold');
                doc.translate(doc.page.width / 2, doc.page.height / 2 + 50);
                doc.rotate(-25);
                doc.text('SECURE', -400, -110, { characterSpacing: 20 });
                doc.restore();

                // 3. Background Dotted Grid
                const dotSpacing = 20;
                doc.fillColor('#E2E8F0').opacity(0.15);
                for (let x = 0; x < doc.page.width; x += dotSpacing) {
                    for (let y = headerHeight + 20; y < doc.page.height; y += dotSpacing) {
                        doc.circle(x, y, 0.4).fill();
                    }
                }
                doc.opacity(1.0);

                let y = headerHeight + 60;
                const col1 = 60;
                const col2 = 340;

                // Row 1: Proprietor & Ledger Reference
                doc.fillColor(LabelGray).fontSize(8).font('Helvetica-Bold').text('PROPRIETOR NAME', col1, y, { characterSpacing: 2 });
                doc.fillColor(LabelGray).fontSize(8).font('Helvetica-Bold').text('LEDGER REFERENCE', col2, y, { characterSpacing: 2 });
                y += 15;

                doc.fillColor(TextBlack).fontSize(28).font('Helvetica-BoldOblique').text((property.ownerName || property.owner || 'N/A').toUpperCase(), col1, y);

                // Ledger Reference Pill
                const refText = property.propertyId || 'N/A';
                const refWidth = doc.widthOfString(refText) + 20;
                doc.rect(col2 - 10, y + 2, refWidth, 24).fill(LedgerBlue);
                doc.fillColor(LedgerText).fontSize(10).font('Helvetica-Bold').text(refText, col2, y + 8);
                y += 85;

                // Row 2: Surface Matrix & Registry Status
                doc.fillColor(LabelGray).fontSize(8).font('Helvetica-Bold').text('SURFACE MATRIX', col1, y, { characterSpacing: 2 });
                doc.fillColor(LabelGray).fontSize(8).font('Helvetica-Bold').text('REGISTRY STATUS', col2, y, { characterSpacing: 2 });
                y += 18;

                // Area sq_ft
                const area = property.areaSqft ? property.areaSqft.toLocaleString() : '0';
                doc.fillColor(TextBlack).fontSize(26).font('Helvetica-Bold').text(area, col1, y, { continued: true });
                doc.fillColor(LabelGray).fontSize(9).font('Helvetica').text(' SQ_FT', { baseline: 'bottom' });

                // Status with Dot
                doc.fillColor(MintGreen).circle(col2 + 5, y + 10, 3).fill();
                doc.fillColor(MintGreen).fontSize(10).font('Helvetica-BoldOblique').text('VALIDATED & SEALED', col2 + 15, y + 6, { characterSpacing: 1 });
                y += 160;

                // Row 3: Geospatial Locus (Full Width)
                doc.fillColor(LabelGray).fontSize(8).font('Helvetica-Bold').text('GEOSPATIAL LOCUS', col1, y, { characterSpacing: 2 });
                y += 25;

                const addr = property.address;
                const addrStr = typeof addr === 'object'
                    ? `${addr.line1 || 'Not Provided'}, ${addr.district || 'Not Provided'}, ${addr.state || 'maha'} ${addr.pincode || '000000'}`
                    : addr || 'N/A';
                doc.fillColor(TextBlack).fontSize(22).font('Helvetica-BoldOblique').text(`"${addrStr}"`, col1, y, { width: 480, lineGap: 5 });

                // --- Footer Section ---
                const footerY = 700;
                doc.fillColor(LabelGray).fontSize(7).font('Helvetica-Bold').text('TRANSACTION:', col1, footerY, { characterSpacing: 1 });
                const txHash = property.chain?.txHash || 'PENDING';
                const displayHash = txHash === 'PENDING' ? txHash : `${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}`;
                doc.fillColor(LabelGray).fontSize(7).font('Helvetica').text(displayHash, col1 + 80, footerY, { width: 250 });

                doc.fillColor(LabelGray).fontSize(7).font('Helvetica-Bold').text('LEDGER_BLOCK:', col1, footerY + 15, { characterSpacing: 1 });
                const blockNum = `#${property.chain?.blockNumber || '10'}`;
                const blockWidth = doc.widthOfString(blockNum) + 6;
                doc.rect(col1 + 80, footerY + 14, blockWidth, 10).fill('#DBEAFE');
                doc.fillColor('#1E40AF').fontSize(7).font('Helvetica-Bold').text(blockNum, col1 + 83, footerY + 16);

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }
};
