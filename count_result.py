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
                total = stats[image_type][source][question_type]['total']
                chose_ours = stats[image_type][source][question_type]['chose_ours']
                percentage = (chose_ours / total * 100) if total > 0 else 0
                print(f"{question_type}:")
                print(f"Total: {total}")
                print(f"Chose ours: {chose_ours} ({percentage:.2f}%)")

def calculate_expert_scores(expert_results_dir):
    # 初始化计数器
    total_scores = defaultdict(float)
    count = 0
    
    # 遍历results目录中的所有文件
    for filename in os.listdir(expert_results_dir):
        if not filename.endswith('.json'):
            continue
            
        with open(os.path.join(expert_results_dir, filename), 'r') as f:
            data = json.load(f)
            
            # 如果数据是列表，遍历每个项目
            if isinstance(data, list):
                for item in data:
                    # 累加各项分数
                    total_scores['composition'] += float(item['compositionRating'])
                    total_scores['semantic'] += float(item['semanticRating'])
                    total_scores['aesthetic'] += float(item['aestheticRating'])
                    count += 1
    
    # 计算平均值
    if count > 0:
        avg_scores = {
            'composition': round(total_scores['composition'] / count, 2),
            'semantic': round(total_scores['semantic'] / count, 2),
            'aesthetic': round(total_scores['aesthetic'] / count, 2),
            'overall': round((total_scores['composition'] + total_scores['semantic'] + 
                            total_scores['aesthetic']) / (count * 3), 2)
        }
        
        # 打印结果
        print(f"\n=== Expert Evaluation Statistics ===")
        print(f"Total images evaluated: {count}")
        print(f"Average scores:")
        print(f"- Composition: {avg_scores['composition']}")
        print(f"- Semantic: {avg_scores['semantic']}")
        print(f"- Aesthetic: {avg_scores['aesthetic']}")
        print(f"- Overall: {avg_scores['overall']}")
        
        # 保存结果到JSON文件
        stats = {
            "total_images": count,
            "average_scores": avg_scores
        }
        
        stats_path = os.path.join(expert_results_dir, "expert_evaluation_stats.json")
        with open(stats_path, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=4, ensure_ascii=False)
        print(f"\nStatistics saved to {stats_path}")
    else:
        print("No valid expert evaluations found")

if __name__ == "__main__":
    # 首先执行原有的比较结果统计
    results_dir = "results"
    stats = count_results(results_dir)
    print_stats(stats)
    
    # 然后执行专家评分统计
    print("\n" + "="*50 + "\n")  # 添加分隔线
    expert_results_dir = "expert-results"
    calculate_expert_scores(expert_results_dir)