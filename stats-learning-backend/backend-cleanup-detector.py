"""
Backend Cleanup Detector
 - Lists Python files under app/
 - Flags potentially unused files (no import references by module name)
 - Finds duplicate files by normalized AST hash

Usage:
  python backend-cleanup-detector.py
"""
from __future__ import annotations

import ast
import hashlib
from pathlib import Path
from typing import Dict, List, Set

APP_DIR = Path(__file__).resolve().parent / "app"


def get_all_python_files(directory: Path) -> List[Path]:
    return [p for p in directory.rglob("*.py") if "__pycache__" not in str(p)]


def extract_imports(file_path: Path) -> Set[str]:
    try:
        src = file_path.read_text(encoding="utf-8")
        tree = ast.parse(src)
    except Exception:
        return set()

    imports: Set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.add(alias.name.split(".")[0])
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.add(node.module.split(".")[0])
    return imports


def is_likely_used(target: Path, all_files: List[Path]) -> bool:
    # Treat main entry and __init__ as used
    if target.name in {"main.py", "__init__.py"}:
        return True
    module_name = target.stem
    for other in all_files:
        if other == target:
            continue
        try:
            content = other.read_text(encoding="utf-8")
        except Exception:
            continue
        if (
            f"from {module_name} import" in content
            or f"import {module_name}" in content
            or f"from .{module_name} import" in content
            or f"from app.{module_name} import" in content
        ):
            return True
    return False


def normalized_ast_hash(file_path: Path) -> str:
    try:
        src = file_path.read_text(encoding="utf-8")
        tree = ast.parse(src)
        normalized = ast.unparse(tree) if hasattr(ast, "unparse") else src
        return hashlib.md5(normalized.encode("utf-8")).hexdigest()
    except Exception:
        return ""


def main() -> None:
    if not APP_DIR.exists():
        print("app/ directory not found")
        raise SystemExit(1)

    print("🔍 Scanning backend codebase...\n")
    files = get_all_python_files(APP_DIR)
    print(f"Found {len(files)} Python files\n")

    # Unused detector (heuristic)
    print("🗑️  Checking for potentially unused files...")
    unused: List[Path] = []
    for f in files:
        # Skip alembic, tests, and init files
        if any(part in str(f) for part in ("alembic", "tests", "__init__.py")):
            continue
        if not is_likely_used(f, files):
            unused.append(f)
    print(f"Found {len(unused)} potentially unused files\n")

    # Duplicates by AST hash
    print("📋 Checking for duplicate files...")
    by_hash: Dict[str, List[Path]] = {}
    for f in files:
        h = normalized_ast_hash(f)
        if not h:
            continue
        by_hash.setdefault(h, []).append(f)
    duplicates = {h: lst for h, lst in by_hash.items() if len(lst) > 1}
    print(f"Found {len(duplicates)} duplicate sets\n")

    print("📄 CLEANUP REPORT")
    print("=" * 60)
    if unused:
        print("\n🗑️  POTENTIALLY UNUSED FILES:\n")
        for f in unused:
            print(f"  ❌ {f.relative_to(APP_DIR)}")
    else:
        print("\n✅ No potentially unused files detected")

    if duplicates:
        print("\n📋 DUPLICATE FILE SETS:\n")
        for h, lst in duplicates.items():
            print(f"  🔗 Hash {h[:8]}:")
            for f in lst:
                print(f"     - {f.relative_to(APP_DIR)}")
    else:
        print("\n✅ No duplicate files detected")


if __name__ == "__main__":
    main()


