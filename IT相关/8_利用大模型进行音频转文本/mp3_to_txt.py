import os
import wave
import json
import threading
from tkinter import filedialog, messagebox
from tkinter import ttk
from tkinter import Tk, Button, IntVar

from future.moves import sys
from vosk import Model, KaldiRecognizer
from pydub import AudioSegment

# 获取当前执行文件的路径
current_dir = os.path.dirname(sys._getframe(0).f_code.co_filename)
MODEL_PATH = os.path.join(current_dir, "vosk-model-cn-0.22")  # 模型文件夹路径


DEFAULT_WINDOW_WIDTH = 512
DEFAULT_WINDOW_HEIGHT = 128


def convert_mp3_to_wav(mp3_file, wav_file):
    """将 MP3 文件转换为符合要求的 WAV 格式"""
    audio = AudioSegment.from_file(mp3_file)
    audio = audio.set_channels(1).set_frame_rate(16000).set_sample_width(2)
    audio.export(wav_file, format="wav")
    print(f"{mp3_file} 已转换为 {wav_file}")


def transcribe_audio(wav_file, txt_file, progress_var):
    """使用 Vosk 进行语音识别并保存文本"""
    model = Model(MODEL_PATH)
    recognizer = KaldiRecognizer(model, 16000)

    with wave.open(wav_file, "rb") as wf:
        total_frames = wf.getnframes()
        result_text = ""

        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if recognizer.AcceptWaveform(data):
                result = json.loads(recognizer.Result())
                result_text += result["text"] + "\n"

            # 更新进度条
            current_pos = wf.tell()
            progress_var.set(int(current_pos / total_frames * 100))

        final_result = json.loads(recognizer.FinalResult())
        result_text += final_result["text"]

    result_text = result_text.replace(" ", "")
    with open(txt_file, "w", encoding="utf-8") as f:
        f.write(result_text)
    print(f"识别结果已保存至 {txt_file}")


def update_ui_after_processing(select_button, progress_bar, file_path, txt_file, wav_file):
    """处理完毕后更新 UI 状态"""
    select_button.config(text="选择音频文件", state="normal")
    progress_bar.grid_remove()  # 隐藏进度条
    os.remove(wav_file)
    messagebox.showinfo("完成", f"识别完成！结果已保存至：\n{txt_file}")


def process_audio(file_path, progress_var, progress_bar, select_button):
    """处理音频文件：转换、识别、删除临时文件"""
    base_name = os.path.splitext(os.path.basename(file_path))[0]
    wav_file = os.path.join(os.path.dirname(file_path), f"{base_name}.wav")
    txt_file = os.path.join(os.path.dirname(file_path), f"{base_name}.txt")

    try:
        # 更新按钮文本
        select_button.config(text=f"正在为你处理 {os.path.basename(file_path)} 请等待", state="disabled")
        progress_var.set(0)  # 重置进度条
        progress_bar.grid(row=2, column=0, padx=20, pady=10)  # 显示进度条

        # 转换 MP3 到 WAV 并执行语音识别
        convert_mp3_to_wav(file_path, wav_file)
        transcribe_audio(wav_file, txt_file, progress_var)
        update_ui_after_processing(select_button, progress_bar, file_path, txt_file, wav_file)

    except FileNotFoundError:
        messagebox.showerror("错误", f"无法找到文件：{wav_file}")
    except Exception as e:
        messagebox.showerror("错误", f"处理失败：{e}")


def select_audio_file(progress_var, progress_bar, select_button):
    """选择音频文件并启动处理流程"""
    file_path = filedialog.askopenfilename(
        title="选择音频文件", filetypes=[("MP3文件", "*.mp3")]
    )
    if file_path:
        threading.Thread(
            target=process_audio,
            args=(file_path, progress_var, progress_bar, select_button),
        ).start()


def create_ui():
    """创建主窗口及UI元素"""
    root = Tk()
    root.title("Derstood工具 -- 音频转文本")

    # 居中显示窗口
    position_top = int(root.winfo_screenheight() / 2 - DEFAULT_WINDOW_HEIGHT / 2)
    position_left = int(root.winfo_screenwidth() / 2 - DEFAULT_WINDOW_WIDTH / 2)
    root.geometry(f"{DEFAULT_WINDOW_WIDTH}x{DEFAULT_WINDOW_HEIGHT}+{position_left}+{position_top}")
    root.resizable(False, False)

    # 检查路径是否有效
    if not os.path.exists(MODEL_PATH):
        messagebox.showinfo("错误", f"模型  vosk-model-cn-0.22  不存在 {MODEL_PATH}")
        sys.exit(0)

    # 创建选择文件按钮
    select_button = Button(root, text="选择音频文件", command=lambda: select_audio_file(progress_var, progress_bar, select_button))
    select_button.grid(row=0, column=0, padx=20, pady=10, columnspan=3, sticky="nsew")

    # 创建进度条
    progress_var = IntVar()
    progress_bar = ttk.Progressbar(root, orient="horizontal", length=300, mode="determinate", variable=progress_var)
    progress_bar.grid(row=1, column=0, padx=20, pady=10, columnspan=3, sticky="nsew")
    progress_bar.grid_remove()  # 默认隐藏进度条

    # 设置 grid 布局，让列占据整个窗口
    root.grid_columnconfigure(0, weight=1)
    root.grid_columnconfigure(1, weight=1)
    root.grid_columnconfigure(2, weight=1)

    # 运行主循环
    root.mainloop()


if __name__ == "__main__":
    create_ui()