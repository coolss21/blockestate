import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

import { ApplicationController } from "../controllers/applicationController.js";
import { RbacDisputeController } from "../controllers/rbacDisputeController.js";
import { CaseController } from "../controllers/caseController.js";
import { AdminController } from "../controllers/adminController.js";

const r = Router();

/* =========================
   Citizen Routes
========================= */
r.post(
  "/applications",
  requireAuth(["citizen"]),
  ApplicationController.create
);

r.get(
  "/applications/my",
  requireAuth(["citizen"]),
  ApplicationController.my
);

r.post(
  "/disputes",
  requireAuth(["citizen"]),
  RbacDisputeController.create
);

r.get(
  "/disputes/my",
  requireAuth(["citizen"]),
  RbacDisputeController.my
);

/* =========================
   Registrar / Admin Routes
========================= */
r.get(
  "/applications/inbox",
  requireAuth(["registrar", "admin"]),
  ApplicationController.inbox
);

r.post(
  "/applications/:id/decide",
  requireAuth(["registrar", "admin"]),
  ApplicationController.decide
);

r.get(
  "/disputes/inbox",
  requireAuth(["registrar", "admin"]),
  RbacDisputeController.inbox
);

r.post(
  "/disputes/:id/refer",
  requireAuth(["registrar", "admin"]),
  RbacDisputeController.referToCourt
);

/* =========================
   Court / Admin Routes
========================= */
r.get(
  "/cases",
  requireAuth(["court", "admin"]),
  CaseController.list
);

r.get(
  "/cases/:id",
  requireAuth(["court", "admin"]),
  CaseController.getOne
);

r.post(
  "/cases/:id/orders",
  requireAuth(["court", "admin"]),
  CaseController.addOrder
);

r.post(
  "/cases/:id/close",
  requireAuth(["court", "admin"]),
  CaseController.close
);

/* =========================
   Admin Routes
========================= */
r.get(
  "/admin/users",
  requireAuth(["admin"]),
  AdminController.listUsers
);

r.post(
  "/admin/users/:id/active",
  requireAuth(["admin"]),
  AdminController.toggleActive
);

export default r;
