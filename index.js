// 全局变量
let isConverting = false;

// DOM 元素
const elements = {
    form: document.getElementById('converterForm'),
    txtFileInput: document.getElementById('txtFile'),
    coverFileInput: document.getElementById('coverFile'),
    authorInput: document.getElementById('author'),
    convertBtn: document.getElementById('convert'),
    progressBar: document.getElementById('progressBar'),
    progressFill: document.getElementById('progressFill'),
    errorMessage: document.getElementById('errorMessage'),
    successMessage: document.getElementById('successMessage'),
    txtFileDisplay: document.getElementById('txtFileDisplay'),
    coverFileDisplay: document.getElementById('coverFileDisplay'),
    txtFileInfo: document.getElementById('txtFileInfo'),
    coverFileInfo: document.getElementById('coverFileInfo'),
    txtFileName: document.getElementById('txtFileName'),
    txtFileSize: document.getElementById('txtFileSize'),
    coverFileName: document.getElementById('coverFileName'),
    coverFileSize: document.getElementById('coverFileSize')
};

// 工具函数
const utils = {
    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 显示错误消息
    showError(message) {
        elements.errorMessage.textContent = message;
        elements.errorMessage.style.display = 'block';
        elements.successMessage.style.display = 'none';
    },

    // 显示成功消息
    showSuccess(message) {
        elements.successMessage.textContent = message;
        elements.successMessage.style.display = 'block';
        elements.errorMessage.style.display = 'none';
    },

    // 隐藏所有消息
    hideMessages() {
        elements.errorMessage.style.display = 'none';
        elements.successMessage.style.display = 'none';
    },

    // 更新进度条
    updateProgress(percent) {
        elements.progressFill.style.width = percent + '%';
    },

    // 显示/隐藏进度条
    toggleProgress(show) {
        elements.progressBar.classList.toggle('show', show);
    },

    // 设置按钮加载状态
    setButtonLoading(loading) {
        elements.convertBtn.disabled = loading;
        elements.convertBtn.classList.toggle('loading', loading);
        isConverting = loading;
    }
};

// 文件处理函数
const fileHandlers = {
    // 处理文件选择
    handleFileSelect(input, display, info, nameEl, sizeEl) {
        const file = input.files[0];
        if (file) {
            // 验证文件类型
            const isValidType = this.validateFileType(file, input);
            if (!isValidType) {
                input.value = '';
                return;
            }

            display.classList.add('has-file');
            display.querySelector('.text').textContent = file.name;
            nameEl.textContent = file.name;
            sizeEl.textContent = utils.formatFileSize(file.size);
            info.classList.add('show');
            
            // 清除之前的错误消息
            utils.hideMessages();
        } else {
            display.classList.remove('has-file');
            display.querySelector('.text').textContent = input === elements.txtFileInput ? 
                '点击选择TXT文件或拖拽到此处' : '点击选择封面图片或拖拽到此处';
            info.classList.remove('show');
        }
    },

    // 验证文件类型
    validateFileType(file, input) {
        if (input === elements.txtFileInput) {
            if (!file.name.toLowerCase().endsWith('.txt')) {
                utils.showError('请选择TXT格式的文件');
                return false;
            }
        } else if (input === elements.coverFileInput) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                utils.showError('请选择JPG、PNG或WebP格式的图片文件');
                return false;
            }
        }
        return true;
    },

    // 处理拖拽事件
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    },

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
    },

    handleDrop(e, input) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            input.files = files;
            input.dispatchEvent(new Event('change'));
        }
    }
};

// 初始化事件监听器
function initEventListeners() {
    // 表单提交
    elements.form.addEventListener('submit', handleFormSubmit);

    // 文件选择
    elements.txtFileInput.addEventListener('change', () => {
        fileHandlers.handleFileSelect(
            elements.txtFileInput, 
            elements.txtFileDisplay, 
            elements.txtFileInfo,
            elements.txtFileName,
            elements.txtFileSize
        );
    });

    elements.coverFileInput.addEventListener('change', () => {
        fileHandlers.handleFileSelect(
            elements.coverFileInput, 
            elements.coverFileDisplay, 
            elements.coverFileInfo,
            elements.coverFileName,
            elements.coverFileSize
        );
    });

    // 拖拽上传
    [elements.txtFileDisplay, elements.coverFileDisplay].forEach((display, index) => {
        const input = index === 0 ? elements.txtFileInput : elements.coverFileInput;
        
        display.addEventListener('dragover', fileHandlers.handleDragOver);
        display.addEventListener('dragleave', fileHandlers.handleDragLeave);
        display.addEventListener('drop', (e) => fileHandlers.handleDrop(e, input));
        
        // 键盘导航支持
        display.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                input.click();
            }
        });

        // 触摸设备优化
        display.addEventListener('touchstart', (e) => {
            e.preventDefault();
            display.classList.add('active');
        });

        display.addEventListener('touchend', (e) => {
            e.preventDefault();
            display.classList.remove('active');
            input.click();
        });

        display.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            display.classList.remove('active');
        });
    });

    // 帮助文本显示/隐藏
    const helpTexts = document.querySelectorAll('.help-text');
    const fileInputs = [elements.txtFileInput, elements.coverFileInput];
    
    fileInputs.forEach((input, index) => {
        const helpId = input.getAttribute('aria-describedby');
        const helpText = document.getElementById(helpId);
        
        if (helpText) {
            input.addEventListener('focus', () => {
                helpText.style.display = 'block';
            });
            
            input.addEventListener('blur', () => {
                // 延迟隐藏，以便用户能看到帮助文本
                setTimeout(() => {
                    if (!input.files.length) {
                        helpText.style.display = 'none';
                    }
                }, 200);
            });
        }
    });
}

// 主转换函数
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (isConverting) return;

    // 验证输入
    if (!elements.txtFileInput.files.length) {
        utils.showError('请选择一个TXT文件');
        return;
    }

    utils.hideMessages();
    utils.setButtonLoading(true);
    utils.toggleProgress(true);
    utils.updateProgress(0);

    try {
        const txtFile = elements.txtFileInput.files[0];
        const coverFile = elements.coverFileInput.files.length ? elements.coverFileInput.files[0] : null;
        
        // 检查文件大小限制
        if (txtFile.size > 50 * 1024 * 1024) { // 50MB
            throw new Error('TXT文件大小不能超过50MB');
        }

        if (coverFile && coverFile.size > 10 * 1024 * 1024) { // 10MB
            throw new Error('封面图片大小不能超过10MB');
        }

        utils.updateProgress(10);

        // 处理封面图片尺寸
        let dimensions = { width: 0, height: 0 };
        if (coverFile) {
            dimensions = await getImageDimensionsFromFile(coverFile);
        }
        const coverExtension = coverFile ? coverFile.type.split("/")[1] : '';
        
        utils.updateProgress(20);

        // 提取书名和作者
        const bookName = extractBookTitle(txtFile.name);
        const fileName = bookName + ".epub";

        // 读取和解析文件内容
        const fileContent = await readFileAsArrayBuffer(txtFile);
        const detectedEncoding = detectEncoding(fileContent) || 'utf-8';
        const decoder = new TextDecoder(detectedEncoding);
        const txtContent = decoder.decode(fileContent).trim();

        utils.updateProgress(30);

        // 提取作者信息
        const authorMatch = txtContent.match(/作者[:：]\s*(.+)/);
        const author = authorMatch ? authorMatch[1].trim() : (elements.authorInput.value || "未知作者");

        // 解析章节
        const chapters = parseChapters(txtContent);
        if (chapters.length === 0) {
            throw new Error('未检测到章节结构。请确保文本包含"第X章"等章节标记。');
        }

        utils.updateProgress(50);

        // 生成EPUB
        const zip = new JSZip();
        
        // 添加基本文件
        addBasicFiles(zip, bookName, author);
        utils.updateProgress(60);

        // 添加章节文件
        addChapterFiles(zip, chapters);
        utils.updateProgress(70);

        // 添加封面
        if (coverFile) {
            await addCoverFiles(zip, coverFile, dimensions, coverExtension);
        }
        utils.updateProgress(80);

        // 添加元数据文件
        addMetadataFiles(zip, bookName, author, chapters, coverFile);
        utils.updateProgress(90);

        // 生成并下载EPUB
        const blob = await zip.generateAsync({ 
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: { level: 6 }
        });
        
        utils.updateProgress(100);
        
        // 下载文件
        const epubUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = epubUrl;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(epubUrl);

        utils.showSuccess(`转换完成！已生成 ${chapters.length} 个章节的EPUB文件：${fileName}`);
        
        // 重置表单（可选）
        setTimeout(() => {
            if (confirm('是否要转换另一个文件？')) {
                elements.form.reset();
                elements.txtFileDisplay.classList.remove('has-file');
                elements.coverFileDisplay.classList.remove('has-file');
                elements.txtFileInfo.classList.remove('show');
                elements.coverFileInfo.classList.remove('show');
                utils.hideMessages();
            }
        }, 3000);
        
    } catch (error) {
        console.error('转换错误:', error);
        let errorMessage = '转换过程中发生错误，请重试';
        
        // 提供更具体的错误信息
        if (error.message.includes('文件大小')) {
            errorMessage = error.message;
        } else if (error.message.includes('章节结构')) {
            errorMessage = error.message;
        } else if (error.message.includes('编码')) {
            errorMessage = '文件编码检测失败，请确保文件是UTF-8或GBK编码';
        } else if (error.message.includes('图片')) {
            errorMessage = '封面图片处理失败，请检查图片格式和大小';
        }
        
        utils.showError(errorMessage);
    } finally {
        utils.setButtonLoading(false);
        setTimeout(() => {
            utils.toggleProgress(false);
            utils.updateProgress(0);
        }, 2000);
    }
}

// 解析章节
function parseChapters(txtContent) {
    const chapterRegex = /(?:^|\n)(第[一二三四五六七八九十0-9]+[章卷][^\n]*|楔子|引言|序章[^\n]*)/g;
    const matches = txtContent.split(chapterRegex);
    const chapters = [];

    for (let i = 1; i < matches.length; i += 2) {
        const title = matches[i].trim();
        let content = matches[i + 1]?.trim() || "";

        // 清理内容
        content = content
            .split(/\n+/)
            .map(line => line.trim())
            .filter(line => line)
            .join("</p><p>");

        const isVolume = /第[一二三四五六七八九十0-9]+卷/.test(title);
        const htmlTitle = isVolume ? `<h1>${title}</h1>` : `<h2>${title}</h2>`;

        chapters.push({
            title,
            content: `${htmlTitle}<p>${content}</p>`
        });
    }

    return chapters;
}

// 添加基本文件
function addBasicFiles(zip, bookName, author) {
    // mimetype
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

    // META-INF/container.xml
    zip.folder("META-INF").file("container.xml", `<?xml version="1.0" encoding="UTF-8"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
  <rootfiles>
    <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

    // CSS样式
    const css = `body { 
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif; 
    line-height: 1.8; 
    margin: 0;
    padding: 20px;
    background: #fff;
    color: #333;
}
h1, h2 { 
    text-align: center; 
    margin: 30px 0 20px 0;
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
}
p { 
    text-indent: 2em; 
    margin: 0 0 1em 0; 
    text-align: justify;
}
.chapter-title {
    font-size: 1.5em;
    font-weight: bold;
}`;
    
    zip.file("style.css", css);
}

// 添加章节文件
function addChapterFiles(zip, chapters) {
    chapters.forEach((chapter, index) => {
        const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh">
  <head>
    <title>${chapter.title}</title>
    <link rel="stylesheet" type="text/css" href="../style.css"/>
  </head>
  <body>${chapter.content}</body>
</html>`;
        
        zip.folder("OEBPS").file(`chapter${index + 1}.xhtml`, xhtml);
    });
}

// 添加封面文件
async function addCoverFiles(zip, coverFile, dimensions, coverExtension) {
    const coverData = await coverFile.arrayBuffer();
    const coverFilename = `cover.${coverExtension}`;
    
    zip.file(coverFilename, coverData);

    // 封面页面
    const titlepage = `<?xml version='1.0' encoding='utf-8'?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta name="calibre:cover" content="true"/>
    <title>封面</title>
  </head>
  <body>
    <div style="text-align: center; margin: 0; padding: 0;">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
           version="1.1" width="100%" height="100%" viewBox="0 0 ${dimensions.width} ${dimensions.height}" 
           preserveAspectRatio="xMidYMid meet">
        <image width="${dimensions.width}" height="${dimensions.height}" xlink:href="${coverFilename}"/>
      </svg>
    </div>
  </body>
</html>`;
    
    zip.file("titlepage.xhtml", titlepage);
}

// 添加元数据文件
function addMetadataFiles(zip, bookName, author, chapters, coverFile) {
    // 导航点
    const navPoints = chapters.map((chapter, index) => {
        const id = `chapter${index + 1}`;
        const playOrder = index + 2;
        return `<navPoint id="navPoint-${id}" playOrder="${playOrder}">
  <navLabel><text>${chapter.title}</text></navLabel>
  <content src="./OEBPS/${id}.xhtml" />
</navPoint>`;
    }).join("\n");

    const coverNavPoint = coverFile ? `<navPoint id="titlepage" playOrder="1">
  <navLabel><text>封面</text></navLabel>
  <content src="titlepage.xhtml" />
</navPoint>` : "";

    // TOC
    zip.file("toc.ncx", `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="book-id" />
    <meta name="dtb:depth" content="1" />
    <meta name="dtb:totalPageCount" content="0" />
    <meta name="dtb:maxPageNumber" content="0" />
  </head>
  <docTitle><text>${bookName}</text></docTitle>
  <docAuthor><text>${author}</text></docAuthor>
  <navMap>
    ${coverNavPoint}
    ${navPoints}
  </navMap>
</ncx>`);

    // Manifest
    const manifest = chapters.map((_, index) => 
        `<item id="chap${index + 1}" href="OEBPS/chapter${index + 1}.xhtml" media-type="application/xhtml+xml"/>`
    ).join("\n");

    let spine = chapters.map((_, index) => `<itemref idref="chap${index + 1}"/>`).join("\n");
    
    let coverManifest = "";
    if (coverFile) {
        const coverFilename = `cover.${coverFile.type.split("/")[1]}`;
        coverManifest = `<item id="coverPage" href="${coverFilename}" media-type="${coverFile.type}"/>
<item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>`;
        spine = `<itemref idref="titlepage" />
${spine}`;
    }

    const metaCover = coverFile ? `<meta name="cover" content="coverPage"></meta>` : "";
    const tocManifest = `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`;

    // content.opf
    zip.file("content.opf", `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${bookName}</dc:title>
    <dc:language>zh</dc:language>
    <dc:creator>${author}</dc:creator>
    <dc:identifier id="book-id">${new Date().getTime()}</dc:identifier>
    <dc:date>${new Date().toISOString()}</dc:date>
    ${metaCover}
  </metadata>
  <manifest>
    ${coverManifest}
    ${manifest}
    ${tocManifest}
  </manifest>
  <spine toc="ncx">
    ${spine}
  </spine>
  <guide>
    <reference type="cover" title="Cover" href="titlepage.xhtml" />
  </guide>
</package>`);
}

// 工具函数
// 使用 ArrayBuffer 检测编码
function detectEncoding(buffer) {
    // 尝试 UTF-8 解码
    try {
        const decoded = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
        console.log("检测结果: UTF-8");
        return 'utf-8';
    } catch (e) {
        console.log("UTF-8 解码失败，可能是 GBK 或其他编码");
    }

    // 如果 UTF-8 解码失败，假定 GBK（更复杂的检测需要其他工具）
    return 'gbk';
}

// 读取文件为 ArrayBuffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// 提取书名
function extractBookTitle(filename) {
    const match = filename.match(/《([^》]+)》/);
    return match ? match[1] : filename.split('.')[0]; // 提取书名号中的内容
}

// 获取图片尺寸
function getImageDimensionsFromFile(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file); // 创建临时 URL

        img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            URL.revokeObjectURL(url); // 释放资源
            resolve({ width, height });
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(new Error("无法加载图片"));
        };

        img.src = url; // 加载图片
    });
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
});