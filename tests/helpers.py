"""
Test helpers for dynamically importing modules from subprojects (backend/ml-service)
without colliding with the root repository src/ package in sys.modules.
"""
import importlib
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
ML_SERVICE_DIR = os.path.join(BASE_DIR, "ml-service")


def import_subproject_module(subproject_dir: str, module_name: str):
    """
    Temporarily swaps sys.path and sys.modules['src'] to import a module from
    backend/src or ml-service/src cleanly, restoring original state afterwards.
    """
    orig_sys_path = list(sys.path)
    orig_src = sys.modules.pop("src", None)
    cached_submods = {k: v for k, v in list(sys.modules.items()) if k.startswith("src.")}
    for k in cached_submods:
        del sys.modules[k]

    try:
        sys.path.insert(0, subproject_dir)
        return importlib.import_module(module_name)
    finally:
        sys.path = orig_sys_path
        if orig_src is not None:
            sys.modules["src"] = orig_src
        sys.modules.update(cached_submods)
