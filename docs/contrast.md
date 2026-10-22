# Bhaav Color System Contrast Verification Report

Generated automatically by testing all Bhaav design tokens against WCAG 2.1 AA requirements.

## 🎯 WCAG 2.1 AA Requirements
- **Body text & Muted text**: Minimum **4.5:1** contrast ratio.
- **Large text**: Minimum **3.0:1** contrast ratio.
- **UI Borders & Focus rings**: Minimum **3.0:1** contrast ratio.

---

## 🌙 Dark Theme (Default)
- `--bg`: `#0F1115`
- `--surface`: `#181B22`

| Element / Token Pair | Foreground | Background | Measured Ratio | Required | Status |
|---|---|---|---|---|---|
| Primary Text vs Background | `--text` (`#ECE9E2`) | `--bg` (`#0F1115`) | **15.59:1** | ≥ 4.5:1 | ✅ PASS |
| Primary Text vs Surface | `--text` (`#ECE9E2`) | `--surface` (`#181B22`) | **14.21:1** | ≥ 4.5:1 | ✅ PASS |
| Muted Text vs Background | `--text-muted` (`#A3A8B3`) | `--bg` (`#0F1115`) | **7.93:1** | ≥ 4.5:1 | ✅ PASS |
| Muted Text vs Surface | `--text-muted` (`#A3A8B3`) | `--surface` (`#181B22`) | **7.23:1** | ≥ 4.5:1 | ✅ PASS |
| Button On-Accent vs Accent | `--on-accent` (`#0F1115`) | `--accent` (`#F0A94B`) | **9.43:1** | ≥ 4.5:1 | ✅ PASS |
| Accent Focus Ring vs Background | `--accent` (`#F0A94B`) | `--bg` (`#0F1115`) | **9.43:1** | ≥ 3.0:1 | ✅ PASS |
| Accent Focus Ring vs Surface | `--accent` (`#F0A94B`) | `--surface` (`#181B22`) | **8.60:1** | ≥ 3.0:1 | ✅ PASS |
| Danger Text vs Danger Background | `--danger-text` (`#F2B8B0`) | `--danger-bg` (`#3A1F1C`) | **8.80:1** | ≥ 4.5:1 | ✅ PASS |
| Danger Text vs Dark Surface | `--danger-text` (`#F2B8B0`) | `--surface` (`#181B22`) | **10.37:1** | ≥ 4.5:1 | ✅ PASS |
| Interactive UI Border vs Background | `--border-interactive` (`#5A6275`) | `--bg` (`#0F1115`) | **3.09:1** | ≥ 3.0:1 | ✅ PASS (Adjusted) |
| Subtle Divider Border | `--border` (`#262A33`) | `--bg` (`#0F1115`) | **1.32:1** | Decorative | ℹ️ PASS (Non-text decorative separator) |

---

## ☀️ Light Theme
- `--bg`: `#FAF7F2`
- `--surface`: `#FFFFFF`

| Element / Token Pair | Foreground | Background | Measured Ratio | Required | Status |
|---|---|---|---|---|---|
| Primary Text vs Background | `--text` (`#1E1B16`) | `--bg` (`#FAF7F2`) | **16.06:1** | ≥ 4.5:1 | ✅ PASS |
| Primary Text vs Surface | `--text` (`#1E1B16`) | `--surface` (`#FFFFFF`) | **17.16:1** | ≥ 4.5:1 | ✅ PASS |
| Muted Text vs Background | `--text-muted` (`#6B6458`) | `--bg` (`#FAF7F2`) | **5.48:1** | ≥ 4.5:1 | ✅ PASS |
| Muted Text vs Surface | `--text-muted` (`#6B6458`) | `--surface` (`#FFFFFF`) | **5.85:1** | ≥ 4.5:1 | ✅ PASS |
| Button On-Accent vs Accent | `--on-accent` (`#FFFFFF`) | `--accent` (`#B45309`) | **5.02:1** | ≥ 4.5:1 | ✅ PASS |
| Accent Focus Ring vs Background | `--accent` (`#B45309`) | `--bg` (`#FAF7F2`) | **4.70:1** | ≥ 3.0:1 | ✅ PASS |
| Accent Focus Ring vs Surface | `--accent` (`#B45309`) | `--surface` (`#FFFFFF`) | **5.02:1** | ≥ 3.0:1 | ✅ PASS |
| Danger Text vs Danger Background | `--danger-text` (`#B42318`) | `--danger-bg` (`#FDECEA`) | **5.75:1** | ≥ 4.5:1 | ✅ PASS |
| Danger Text vs Light Surface | `--danger-text` (`#B42318`) | `--surface` (`#FFFFFF`) | **6.11:1** | ≥ 4.5:1 | ✅ PASS |
| Interactive UI Border vs Background | `--border-interactive` (`#948C7E`) | `--bg` (`#FAF7F2`) | **3.11:1** | ≥ 3.0:1 | ✅ PASS (Adjusted) |
| Subtle Divider Border | `--border` (`#E6DFD3`) | `--bg` (`#FAF7F2`) | **1.24:1** | Decorative | ℹ️ PASS (Non-text decorative separator) |

---

## ⚙️ Token Adjustments & Explanation
1. **Interactive UI Control Borders (`--border-interactive`)**:
   - The default decorative separator border `--border` (`#262A33` in dark, `#E6DFD3` in light) has low contrast (~1.3:1) intended for subtle section dividers.
   - To satisfy the **≥ 3.0:1** requirement for interactive UI boundaries (input boxes, focusable card borders, select dropdowns), we added `--border-interactive`:
     - **Dark:** `#5A6275` (achieves **3.09:1** against `#0F1115`).
     - **Light:** `#948C7E` (achieves **3.11:1** against `#FAF7F2`).
2. **Focus Rings**:
   - Focus rings use `--accent` (`#F0A94B` in dark achieving **9.43:1**, and `#B45309` in light achieving **4.70:1 / 5.02:1**), surpassing the 3.0:1 threshold with high visibility.
