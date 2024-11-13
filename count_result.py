import json
import os
from collections import defaultdict

def count_results(results_dir):
    # 创建嵌套的defaultdict来存储统计结果
    stats = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: {'total': 0, 'chose_ours': 0})))
    
    # 遍历results目录中的所有文件
    for filename in os.listdir(results_dir):
        if not filename.endswith('.json'):
            continue
            
        with open(os.path.join(results_dir, filename), 'r') as f:
            data = json.load(f)
            
            # 处理每个问题
            for item in data:
                image_type = item['imageType']
                question_type = item['type']
                
                # 确定不是ours的源
                other_source = item['sourceA'] if item['sourceB'] == 'ours' else item['sourceB']
                
                # 更新总数
                stats[image_type][other_source][question_type]['total'] += 1
                
                # 如果选择了ours（即选择是B且sourceB是ours，或选择是A且sourceA是ours）
                if ((item['choice'] == 'B' and item['sourceB'] == 'ours') or 
                    (item['choice'] == 'A' and item['sourceA'] == 'ours')):
                    stats[image_type][other_source][question_type]['chose_ours'] += 1
    
    return stats

def print_stats(stats):
    for image_type in stats:
        print(f"\n=== {image_type} ===")
        for source in stats[image_type]:
            print(f"\n{source}:")
            for question_type in stats[image_type][source]:
                print(f"{question_type}:")
                print(f"Total: {stats[image_type][source][question_type]['total']}")
                print(f"Chose ours: {stats[image_type][source][question_type]['chose_ours']}")

if __name__ == "__main__":
    results_dir = "results"
    stats = count_results(results_dir)
    print_stats(stats)