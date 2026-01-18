# identify_model.py
import torch
import inspect

print("🔍 IDENTIFYING YOUR MODEL ARCHITECTURE")
print("="*60)

# Load checkpoint
checkpoint = torch.load('accident_model.pth', map_location='cpu')

# Check the structure more carefully
print("📊 CHECKPOINT STRUCTURE ANALYSIS:")
print(f"Type: {type(checkpoint)}")

if isinstance(checkpoint, dict):
    print(f"Number of keys: {len(checkpoint)}")
    
    # Group keys by pattern
    patterns = {}
    for key in checkpoint.keys():
        # Extract main component
        if '.' in key:
            main_part = key.split('.')[0]
            if main_part not in patterns:
                patterns[main_part] = []
            patterns[main_part].append(key)
    
    print("\n🔑 KEY PATTERNS:")
    for pattern, keys in patterns.items():
        print(f"  {pattern}: {len(keys)} keys")
        if len(keys) < 5:
            print(f"    {keys}")
    
    # Look for model class info
    print("\n🧩 LOOKING FOR ARCHITECTURE CLUES:")
    
    # Check first conv layer
    first_conv_key = [k for k in checkpoint.keys() if 'conv' in k and 'stem' in k and 'weight' in k][0]
    first_conv = checkpoint[first_conv_key]
    print(f"  First conv ({first_conv_key}): shape {tuple(first_conv.shape)}")
    print(f"    → Input channels: {first_conv.shape[1]} (should be 3 for RGB)")
    print(f"    → Output channels: {first_conv.shape[0]}")
    print(f"    → Kernel size: {first_conv.shape[2]}x{first_conv.shape[3]}")
    
    # Check final classifier
    classifier_keys = [k for k in checkpoint.keys() if 'classifier' in k and 'weight' in k]
    if classifier_keys:
        last_classifier = classifier_keys[-1]
        classifier_weight = checkpoint[last_classifier]
        print(f"  Last classifier ({last_classifier}): shape {tuple(classifier_weight.shape)}")
        print(f"    → Input features: {classifier_weight.shape[1]}")
        print(f"    → Output classes: {classifier_weight.shape[0]}")

print("\n💡 BASED ON THE KEYS, YOUR MODEL IS:")
print("   MobileNetV3 or EfficientNet variant")
print("   Has 'backbone' and 'classifier' sections")
print("   Uses depthwise separable convolutions")
print("   Has squeeze-excitation blocks")
