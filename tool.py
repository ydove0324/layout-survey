from PIL import Image
import os

def resize_images():
    # 定义源文件夹和目标尺寸
    base_folder = '.'
    room_types = ['experts']
    target_size = (960, 540)

    # 遍历所有房间类型文件夹
    for room in room_types:
        folder_path = os.path.join(base_folder, room)
        
        # 检查文件夹是否存在
        if not os.path.exists(folder_path):
            print(f"跳过不存在的文件夹: {folder_path}")
            continue

        # 获取所有 PNG 文件
        png_files = [f for f in os.listdir(folder_path) if f.lower().endswith('.png')]
        
        for png_file in png_files:
            image_path = os.path.join(folder_path, png_file)
            
            try:
                # 打开图片
                with Image.open(image_path) as img:
                    # 检查图片是否需要调整大小
                    if img.size != target_size:
                        # 使用 LANCZOS 重采样方法调整图片大小
                        resized_img = img.resize(target_size, Image.Resampling.LANCZOS)
                        # 保存调整后的图片（覆盖原图）
                        resized_img.save(image_path, 'PNG')
                        print(f"已处理: {image_path}")
                    else:
                        print(f"跳过已经是目标尺寸的图片: {image_path}")
            
            except Exception as e:
                print(f"处理图片 {image_path} 时出错: {str(e)}")

if __name__ == '__main__':
    resize_images() 
