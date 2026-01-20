#!/usr/bin/env python3
"""
MOC 인덱싱용 YAML Frontmatter 생성기

Usage:
    python generate_frontmatter.py "🖋 1.1a.1a1 2025-10-15" "📅 1.1a.1a 10"
    python generate_frontmatter.py --emoji 🖋 --index 1.1a.1a1 --name "2025-10-15" --parent "📅 1.1a.1a 10"
"""

import argparse
from datetime import datetime


def generate_frontmatter(title: str, parent: str) -> str:
    """YAML frontmatter 생성"""
    # title에서 인덱스 추출
    parts = title.split(" ", 2)
    if len(parts) >= 2:
        moc_id = parts[1]
    else:
        moc_id = ""
    
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    return f"""---
title: "{title}"
moc id: "{moc_id}"
back link: "[[{parent}]]"
createdAt: {now}
updatedAt: {now}
---
"""


def main():
    parser = argparse.ArgumentParser(description="MOC YAML Frontmatter 생성기")
    
    # 간단 모드: 두 개의 위치 인자
    parser.add_argument("title", nargs="?", help='전체 제목 (예: "🖋 1.1a.1a1 2025-10-15")')
    parser.add_argument("parent", nargs="?", help='부모 노트명 (예: "📅 1.1a.1a 10")')
    
    # 상세 모드
    parser.add_argument("--emoji", help="이모지")
    parser.add_argument("--index", help="인덱스")
    parser.add_argument("--name", help="이름")
    parser.add_argument("--parent-note", dest="parent_note", help="부모 노트명")
    
    args = parser.parse_args()
    
    # 상세 모드
    if args.emoji and args.index and args.name:
        title = f"{args.emoji} {args.index} {args.name}"
        parent = args.parent_note or ""
    # 간단 모드
    elif args.title:
        title = args.title
        parent = args.parent or ""
    else:
        parser.print_help()
        return
    
    print(generate_frontmatter(title, parent))


if __name__ == "__main__":
    main()
