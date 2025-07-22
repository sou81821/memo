from flask import Flask, request, jsonify
from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch

app = Flask(__name__)

# モデルとトークナイザーの準備
# このモデルはサイズが大きいため、Vercelの無料プランではメモリ制限に達する可能性があります。
# その場合は、より軽量なモデルを検討する必要があります。
model_name = "sonoisa/t5-base-japanese-memento"
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name)

@app.route('/api/summarize', methods=['POST'])
def summarize_text():
    data = request.get_json()
    if 'text' not in data:
        return jsonify({'error': 'text is required'}), 400

    text = data['text']

    # テキストのエンコード
    # 長いテキストを要約する場合、max_lengthの調整が必要になることがあります。
    inputs = tokenizer.encode(
        "summarize: " + text,
        return_tensors="pt",
        max_length=512,
        truncation=True
    )

    # 要約の生成
    # パラメータを調整することで、要約の質や長さを変更できます。
    summary_ids = model.generate(
        inputs,
        max_length=150,
        min_length=40,
        length_penalty=2.0,
        num_beams=4,
        early_stopping=True
    )

    # 要約テキストのデコード
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    return jsonify({'summary': summary})

# Vercel環境では、この部分は実行されません。
# ローカルでのテスト用に残しておきます。
if __name__ == '__main__':
    app.run(debug=True, port=5001)
