import os
import re

ROOT = '.'  # 当前目录
IGNORE = {'_sidebar.md'}


def natural_sort_key(s):
    """
    生成一个用于自然排序的键。
    只对最后一个路径组件（文件名或目录名）排序，并按数字分组。
    """
    base_name = os.path.basename(s.replace('\\', '/'))

    def convert(text):
        return int(text) if text.isdigit() else text.lower()

    return [convert(text) for text in re.split(r'(\d+)', base_name) if text]


def generate_sidebar_links(root_dir):
    """
    遍历 ROOT 目录，生成侧边栏所需的所有行。
    此函数仅处理 ROOT 目录和其下的一级子目录，实现扁平化结构。
    """
    sidebar_items = []

    # 获取 ROOT 目录下的所有内容 (文件和一级目录)
    try:
        all_names = os.listdir(root_dir)
    except FileNotFoundError:
        print(f"错误: 根目录 {root_dir} 未找到。")
        return sidebar_items

    # ------------------ 1. 处理 ROOT 目录下的文件 ------------------
    # 查找并排序 ROOT 目录下的所有 Markdown 文件 (如 8_利用大模型进行音频转文本.md)
    root_files = sorted(
        [name for name in all_names if
         os.path.isfile(os.path.join(root_dir, name)) and name.endswith('.md') and name not in IGNORE],
        key=natural_sort_key
    )
    for filename in root_files:
        filepath_web = os.path.join(root_dir, filename).replace('\\', '/')
        link_text = os.path.splitext(filename)[0]
        # ROOT 目录下的文件没有缩进
        sidebar_items.append(f'- [{link_text}]({filepath_web})')

    # ------------------ 2. 处理一级分类目录 ------------------
    # 查找并排序 ROOT 目录下的所有一级目录
    level1_dirs = sorted(
        [name for name in all_names if os.path.isdir(os.path.join(root_dir, name)) and not name.startswith('.')],
        key=natural_sort_key
    )

    for category_name in level1_dirs:
        category_path = os.path.join(root_dir, category_name)

        # 2a. 添加一级目录标题 (分类)
        sidebar_items.append(f'- {category_name}')

        # 2b. 收集当前分类目录下的所有链接 (文件和二级目录)
        category_links_to_sort = []

        try:
            category_contents = os.listdir(category_path)
        except Exception as e:
            print(f"警告: 无法读取目录 {category_path}. 错误: {e}")
            continue

        # 将文件和目录分开，并分别进行排序
        level2_dirs = sorted(
            [name for name in category_contents if
             os.path.isdir(os.path.join(category_path, name)) and not name.startswith('.')],
            key=natural_sort_key
        )
        level2_files = sorted(
            [name for name in category_contents if
             os.path.isfile(os.path.join(category_path, name)) and name.endswith('.md') and name not in IGNORE],
            key=natural_sort_key
        )

        # i. 处理一级目录下的文件 (直接的 MD 文件)
        for filename in level2_files:
            filepath_web = os.path.join(category_path, filename).replace('\\', '/')
            link_text = os.path.splitext(filename)[0]
            # 使用文件路径作为排序键
            category_links_to_sort.append((filename, f'  - [{link_text}]({filepath_web})'))

        # ii. 处理二级目录 (包含同名 MD 文件的标题目录)
        for sub_dirname in level2_dirs:
            sub_dir_path = os.path.join(category_path, sub_dirname)
            md_filename = sub_dirname + '.md'
            md_filepath_web = os.path.join(sub_dir_path, md_filename).replace('\\', '/')

            # (可选的) 检查文件是否存在
            if not os.path.exists(os.path.join(sub_dir_path, md_filename)):
                print(f"警告: 目录 {sub_dir_path} 缺少同名文件 {md_filename}，该链接将被跳过。")
                continue

            link_text = sub_dirname  # 链接文本使用目录名
            # 使用目录名作为排序键
            category_links_to_sort.append((sub_dirname, f'  - [{link_text}]({md_filepath_web})'))

        # 2c. 对所有链接进行自然排序并输出
        category_links_to_sort.sort(key=lambda x: natural_sort_key(x[0]))

        for _, link_md in category_links_to_sort:
            sidebar_items.append(link_md)

    return sidebar_items


# --- 主执行逻辑 ---
sidebar_lines = generate_sidebar_links(ROOT)

with open('_sidebar.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sidebar_lines))

print("生成完成：_sidebar.md")