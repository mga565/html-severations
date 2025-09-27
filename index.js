document.addEventListener('DOMContentLoaded', function() {
            const fileInput = document.getElementById('file-input');
            const uploadArea = document.getElementById('upload-area');
            const processBtn = document.getElementById('process-btn');
            const results = document.getElementById('results');
            const spinner = document.getElementById('spinner');
            const errorMessage = document.getElementById('error-message');
            const fileInfo = document.getElementById('file-info');
            const notification = document.getElementById('notification');
            
            const htmlPreview = document.getElementById('html-preview');
            const cssPreview = document.getElementById('css-preview');
            const jsPreview = document.getElementById('js-preview');
            
            const downloadHtml = document.getElementById('download-html');
            const downloadCss = document.getElementById('download-css');
            const downloadJs = document.getElementById('download-js');
            
            const htmlCopyBtn = document.querySelector('[data-target="html-preview"]');
            const cssCopyBtn = document.querySelector('[data-target="css-preview"]');
            const jsCopyBtn = document.querySelector('[data-target="js-preview"]');
            
            let uploadedFile = null;
            
            // Upload area click event
            uploadArea.addEventListener('click', function() {
                fileInput.click();
            });
            
            // Drag and drop functionality
            uploadArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                uploadArea.style.backgroundColor = '#f0ecfd';
                uploadArea.style.borderColor = '#6e8efb';
            });
            
            uploadArea.addEventListener('dragleave', function() {
                uploadArea.style.backgroundColor = '#f9f7fe';
                uploadArea.style.borderColor = '#a777e3';
            });
            
            uploadArea.addEventListener('drop', function(e) {
                e.preventDefault();
                uploadArea.style.backgroundColor = '#f9f7fe';
                uploadArea.style.borderColor = '#a777e3';
                
                if (e.dataTransfer.files.length) {
                    handleFileSelection(e.dataTransfer.files[0]);
                }
            });
            
            // File input change event
            fileInput.addEventListener('change', function() {
                if (fileInput.files.length) {
                    handleFileSelection(fileInput.files[0]);
                }
            });
            
            // Process button click event
            processBtn.addEventListener('click', function() {
                if (!uploadedFile) return;
                
                // Show spinner and hide error
                spinner.style.display = 'block';
                errorMessage.style.display = 'none';
                results.style.display = 'none';
                
                // Process the file
                processFile();
            });
            
            // Copy button functionality
            document.addEventListener('click', function(e) {
                const button = e.target.closest('.btn-clipboard');
                if (button && !button.disabled) {
                    const targetId = button.getAttribute('data-target');
                    const contentElement = document.getElementById(targetId);
                    const content = contentElement.textContent;
                    
                    // Don't copy if it's the placeholder text
                    if (content === 'No HTML content found' || 
                        content === 'No CSS content found' || 
                        content === 'No JavaScript content found') {
                        return;
                    }
                    
                    copyToClipboard(content, button);
                }
            });
            
            function handleFileSelection(file) {
                // Check if file is HTML
                if (!file.name.toLowerCase().endsWith('.html') && 
                    !file.name.toLowerCase().endsWith('.htm')) {
                    showError('Please upload an HTML file (.html or .htm)');
                    return;
                }
                
                uploadedFile = file;
                processBtn.disabled = false;
                uploadArea.querySelector('.upload-text').textContent = `Selected: ${file.name}`;
                fileInfo.textContent = `Files will be saved as: index.html, style.css (if CSS found), index.js (if JS found)`;
                errorMessage.style.display = 'none';
            }
            
            function processFile() {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    try {
                        const content = e.target.result;
                        
                        // Extract HTML, CSS, and JS
                        const { html, css, js } = separateContent(content);
                        
                        // Display the content
                        htmlPreview.textContent = html || 'No HTML content found';
                        cssPreview.textContent = css || 'No CSS content found';
                        jsPreview.textContent = js || 'No JavaScript content found';
                        
                        // Enable/disable buttons based on content availability
                        toggleButtons(html, css, js);
                        
                        // Create download links with the original filename
                        createDownloadLinks(html, css, js);
                        
                        // Show results
                        results.style.display = 'block';
                    } catch (error) {
                        showError('Error processing file: ' + error.message);
                    } finally {
                        spinner.style.display = 'none';
                    }
                };
                
                reader.onerror = function() {
                    showError('Error reading file');
                    spinner.style.display = 'none';
                };
                
                reader.readAsText(uploadedFile);
            }
            
            function separateContent(content) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(content, 'text/html');
                
                let css = '';
                // Extract CSS from <style> tags
                const styleElements = doc.querySelectorAll('style');
                styleElements.forEach(style => {
                    css += style.textContent + '\n';
                    style.remove();
                });
                
                let js = '';
                // Extract JS from <script> without src
                const scriptElements = doc.querySelectorAll('script:not([src])');
                scriptElements.forEach(script => {
                    js += script.textContent + '\n';
                    script.remove();
                });
                
                // Now, add the links if extracted
                if (css.trim()) {
                    const link = doc.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'style.css';
                    doc.head.appendChild(link);
                }
                
                if (js.trim()) {
                    const script = doc.createElement('script');
                    script.src = 'index.js';
                    script.defer = true;
                    doc.body.appendChild(script);
                }
                
                // Get the html string
                let htmlString = doc.documentElement.outerHTML;
                
                // Add doctype if not present
                if (!htmlString.toUpperCase().startsWith('<!DOCTYPE')) {
                    htmlString = '<!DOCTYPE html>\n' + htmlString;
                }
                
                return {
                    html: htmlString.trim() || 'No HTML content found',
                    css: css.trim() || 'No CSS content found',
                    js: js.trim() || 'No JavaScript content found'
                };
            }
            
            function toggleButtons(html, css, js) {
                // Enable HTML buttons by default (there should always be HTML content)
                htmlCopyBtn.disabled = false;
                downloadHtml.classList.remove('disabled');
                
                // Enable CSS buttons only if there's CSS content
                if (css !== 'No CSS content found') {
                    cssCopyBtn.disabled = false;
                    downloadCss.classList.remove('disabled');
                } else {
                    cssCopyBtn.disabled = true;
                    downloadCss.classList.add('disabled');
                }
                
                // Enable JS buttons only if there's JS content
                if (js !== 'No JavaScript content found') {
                    jsCopyBtn.disabled = false;
                    downloadJs.classList.remove('disabled');
                } else {
                    jsCopyBtn.disabled = true;
                    downloadJs.classList.add('disabled');
                }
            }
            
            function createDownloadLinks(html, css, js) {
                // Create blobs and URLs for HTML
                const htmlBlob = new Blob([html], { type: 'text/html' });
                downloadHtml.href = URL.createObjectURL(htmlBlob);
                downloadHtml.download = `index.html`;
                
                // Create blobs and URLs for CSS only if there's CSS content
                if (css !== 'No CSS content found') {
                    const cssBlob = new Blob([css], { type: 'text/css' });
                    downloadCss.href = URL.createObjectURL(cssBlob);
                    downloadCss.download = `style.css`;
                }
                
                // Create blobs and URLs for JS only if there's JS content
                if (js !== 'No JavaScript content found') {
                    const jsBlob = new Blob([js], { type: 'text/javascript' });
                    downloadJs.href = URL.createObjectURL(jsBlob);
                    downloadJs.download = `index.js`;
                }
            }
            
            function copyToClipboard(text, button) {
                // Create a temporary textarea element
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                
                // Select and copy the text
                textarea.select();
                textarea.setSelectionRange(0, 99999); // For mobile devices
                
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        // Show notification
                        notification.style.display = 'block';
                        setTimeout(() => {
                            notification.style.display = 'none';
                        }, 3000);
                        
                        // Change button to check icon and green background
                        button.classList.add('copied');
                        
                        setTimeout(() => {
                            button.classList.remove('copied');
                        }, 2000);
                    }
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                }
                
                // Remove the temporary textarea
                document.body.removeChild(textarea);
            }
            
            function showError(message) {
                errorMessage.textContent = message;
                errorMessage.style.display = 'block';
                spinner.style.display = 'none';
                results.style.display = 'none';
                fileInfo.textContent = '';
            }
        });