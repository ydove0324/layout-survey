import os
import json

def get_image_list():
    # 定义需要扫描的文件夹
    base_folders = ['ours', 'diffuscene', 'layoutGPT', 'holodeck']
    room_types = ['living_room', 'dining_room', 'bedroom']
    
    image_map = {}
    
    # 扫描每个文件夹
    for base in base_folders:
        for room in room_types:
            folder_path = os.path.join('.', base, room)
            if os.path.exists(folder_path):
                # 获取所有 PNG 文件
                images = [f for f in os.listdir(folder_path) if f.lower().endswith('.png')]
                image_map[f'{base}/{room}'] = images

    # 将结果写入 JSON 文件
    with open('images.json', 'w', encoding='utf-8') as f:
        json.dump(image_map, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    get_image_list() 