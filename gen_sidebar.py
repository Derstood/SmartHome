import os
import re

ROOT = '.'  # 当前目录
IGNORES = {'_sidebar.md', 'favicon_io'}

# 最大零填充宽度 (用于确保自然排序的字符串比较)
MAX_PADDING_WIDTH = 5


def natural_sort_key(s):
    """
    生成一个用于智能排序的键。
    1. 如果包含数字，则 Group ID 为 0，并进行零填充字符串的自然排序。
    2. 如果不包含数字，则 Group ID 为 1，并进行字母排序。
    """
    base_name = os.path.basename(s.replace('\\', '/'))
    parts = [text for text in re.split(r'(\d+)', base_name) if text]

    has_digits = any(part.isdigit() for part in parts)

    # 定义转换函数：将数字转换为零填充字符串，其他转换为小写字符串
    def convert(text):
        if text.isdigit():
            # 转换为零填充字符串，确保 '10' > '2'
            return text.zfill(MAX_PADDING_WIDTH)
        else:
            return text.lower()

    if has_digits:
        # 组 0: 数字规范文件，优先排序。所有后续元素都是字符串。
        # Key: [0, '00001', '_monkey...']
        return [0] + [convert(text) for text in parts]
    else:
        # 组 1: 其他文件，排在数字文件之后。
        # Key: [1, 'calculate_work_timing_in_jail.js']
        return [1, base_name.lower()]


def generate_sidebar_links(root_dir):
    """
    遍历 ROOT 目录，显示一级目录，并递归收集其下所有允许后缀的文件进行统一排序。
    """
    sidebar_items = []

    # ------------------ 1. 处理 ROOT 目录下的文件 ------------------
    root_files = []
    try:
        for name in os.listdir(root_dir):
            if os.path.isfile(os.path.join(root_dir, name)) and name.endswith('.md') and name not in IGNORES:
                root_files.append(name)
    except FileNotFoundError:
        print(f"错误: 根目录 {root_dir} 未找到。")
        return sidebar_items

    root_files.sort(key=natural_sort_key)

    for filename in root_files:
        filepath_web = os.path.join(root_dir, filename).replace('\\', '/')
        link_text = os.path.splitext(filename)[0]
        sidebar_items.append(f'- [{link_text}]({filepath_web})')

    # ------------------ 2. 处理一级分类目录 ------------------

    all_names = os.listdir(root_dir)
    level1_dirs = sorted(
        [name for name in all_names if os.path.isdir(os.path.join(root_dir, name)) and
         not name.startswith('.') and name not in IGNORES],
        key=natural_sort_key
    )

    for category_name in level1_dirs:
        category_path = os.path.join(root_dir, category_name)

        # 2a. 添加一级目录标题 (分类)
        sidebar_items.append(f'- {category_name}')

        # 2b. 递归收集一级目录下的所有文件
        category_links_to_sort = []

        for dirpath, _, filenames in os.walk(category_path):
            if os.path.basename(dirpath).startswith('.'):
                continue

            for filename in filenames:
                if filename.endswith('.md') and filename not in IGNORES:
                    filepath = os.path.join(dirpath, filename)
                    filepath_web = filepath.replace('\\', '/')
                    link_text = os.path.splitext(filename)[0]
                    link_md = f'  - [{link_text}]({filepath_web})'

                    category_links_to_sort.append((filepath, link_md))

        # 2c. 对所有收集到的链接进行智能排序并输出
        category_links_to_sort.sort(key=lambda x: natural_sort_key(x[0]))

        for _, link_md in category_links_to_sort:
            sidebar_items.append(link_md)

    return sidebar_items


# --- 主执行逻辑 ---
sidebar_lines = generate_sidebar_links(ROOT)
# 去掉README
del sidebar_lines[0]
# 加个跳转主页的图标
sidebar_lines.append(
    '\n<br>\n\n<a href="#/README.md">\n  <img src="favicon_io/LOGO.png" width="120" style="margin:30px auto;display:block;">\n</a>'
)
with open('_sidebar.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sidebar_lines))

print("生成完成：_sidebar.md")
