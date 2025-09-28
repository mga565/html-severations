// JavaScript from index.html

        document.addEventListener('DOMContentLoaded', function() {
            const fileInput = document.getElementById('file-input');
            const uploadArea = document.getElementById('upload-area');
            const processBtn = document.getElementById('process-btn');
            const results = document.getElementById('results');
            const spinner = document.getElementById('spinner');
            const errorMessage = document.getElementById('error-message');
            const fileInfo = document.getElementById('file-info');
            const fileList = document.getElementById('file-list');
            const notification = document.getElementById('notification');
            const htmlFilePreviews = document.getElementById('html-file-previews');
            const htmlFileLinks = document.getElementById('html-file-links');
            const filterButtons = document.querySelectorAll('.filter-btn');
            
            const cssPreview = document.getElementById('css-preview');
            const jsPreview = document.getElementById('js-preview');
            const cssHeading = document.getElementById('css-heading');
            const jsHeading = document.getElementById('js-heading');
            const downloadCss = document.getElementById('download-css');
            const downloadJs = document.getElementById('download-js');
            const downloadCssText = document.getElementById('download-css-text');
            const downloadJsText = document.getElementById('download-js-text');
            
            const cssCopyBtn = document.querySelector('[data-target="css-preview"]');
            const jsCopyBtn = document.querySelector('[data-target="js-preview"]');
            
            let uploadedFiles = [];
            let currentFilter = 'all';
            
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
                    handleFileSelection(Array.from(e.dataTransfer.files));
                }
            });
            
            // File input change event
            fileInput.addEventListener('change', function() {
                if (fileInput.files.length) {
                    handleFileSelection(Array.from(fileInput.files));
                }
            });
            
            // Filter buttons
            filterButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    filterButtons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentFilter = this.getAttribute('data-filter');
                    updateFileListDisplay();
                });
            });
            
            // Process button click event
            processBtn.addEventListener('click', function() {
                if (!uploadedFiles.length) return;
                
                // Show spinner and hide error
                spinner.style.display = 'block';
                errorMessage.style.display = 'none';
                results.style.display = 'none';
                
                // Process the files
                processFiles();
            });
            
            // Copy button functionality
            document.addEventListener('click', function(e) {
                const button = e.target.closest('.btn-clipboard');
                if (button && !button.disabled) {
                    const targetId = button.getAttribute('data-target');
                    const contentElement = document.getElementById(targetId);
                    
                    // For HTML file previews, we need to handle differently
                    if (targetId.startsWith('html-preview-')) {
                        const content = contentElement.textContent;
                        copyToClipboard(content, button);
                    } else {
                        const content = contentElement.textContent;
                        
                        // Don't copy if it's the placeholder text
                        if (content === 'No CSS content found' || 
                            content === 'No JavaScript content found') {
                            return;
                        }
                        
                        copyToClipboard(content, button);
                    }
                }
            });
            
            function handleFileSelection(files) {
                // Filter only HTML and CSS files
                const validFiles = files.filter(file => 
                    file.name.toLowerCase().endsWith('.html') || 
                    file.name.toLowerCase().endsWith('.htm') ||
                    file.name.toLowerCase().endsWith('.css')
                );
                
                if (validFiles.length === 0) {
                    showError('Please upload HTML or CSS files (.html, .htm, or .css)');
                    return;
                }
                
                // Check for invalid files
                const invalidFiles = files.filter(file => 
                    !file.name.toLowerCase().endsWith('.html') && 
                    !file.name.toLowerCase().endsWith('.htm') &&
                    !file.name.toLowerCase().endsWith('.css')
                );
                
                if (invalidFiles.length > 0) {
                    showError(`Skipped ${invalidFiles.length} invalid file(s)`);
                }
                
                // Add new files to uploadedFiles array
                uploadedFiles = [...uploadedFiles, ...validFiles];
                processBtn.disabled = uploadedFiles.length === 0;
                
                // Update file list display
                updateFileListDisplay();
                
                fileInfo.textContent = `CSS from all files will be combined. HTML files will keep their original names.`;
                errorMessage.style.display = 'none';
            }
            
            function updateFileListDisplay() {
                fileList.innerHTML = '';
                
                const filteredFiles = uploadedFiles.filter(file => {
                    if (currentFilter === 'all') return true;
                    if (currentFilter === 'html') 
                        return file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm');
                    if (currentFilter === 'css') 
                        return file.name.toLowerCase().endsWith('.css');
                    return true;
                });
                
                filteredFiles.forEach((file, index) => {
                    const fileItem = document.createElement('span');
                    fileItem.className = 'file-list-item';
                    fileItem.textContent = file.name;
                    
                    const badge = document.createElement('span');
                    badge.className = 'file-type-badge';
                    
                    if (file.name.toLowerCase().endsWith('.css')) {
                        badge.classList.add('css-badge');
                        badge.textContent = 'CSS';
                    } else {
                        badge.classList.add('html-badge');
                        badge.textContent = 'HTML';
                    }
                    
                    fileItem.appendChild(badge);
                    
                    // Add remove button
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = '×';
                    removeBtn.style.cssText = `
                        background: #e74c3c;
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        font-size: 12px;
                        margin-left: 5px;
                        cursor: pointer;
                    `;
                    removeBtn.onclick = function(e) {
                        e.stopPropagation();
                        uploadedFiles.splice(index, 1);
                        processBtn.disabled = uploadedFiles.length === 0;
                        updateFileListDisplay();
                    };
                    
                    fileItem.appendChild(removeBtn);
                    fileList.appendChild(fileItem);
                });
            }
            
            function processFiles() {
                const htmlFiles = uploadedFiles.filter(file => 
                    file.name.toLowerCase().endsWith('.html') || 
                    file.name.toLowerCase().endsWith('.htm')
                );
                
                const cssFiles = uploadedFiles.filter(file => 
                    file.name.toLowerCase().endsWith('.css')
                );
                
                const readers = [];
                const htmlContents = [];
                const cssContents = [];
                
                // Read HTML files
                htmlFiles.forEach((file, index) => {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        htmlContents[index] = {
                            name: file.name,
                            content: e.target.result
                        };
                        
                        // Check if all files have been read
                        if (htmlContents.length === htmlFiles.length && 
                            htmlContents.every(fc => fc !== undefined) &&
                            cssContents.length === cssFiles.length) {
                            processAllFiles(htmlContents, cssContents);
                        }
                    };
                    
                    reader.onerror = function() {
                        showError('Error reading file: ' + file.name);
                        spinner.style.display = 'none';
                    };
                    
                    readers.push(reader);
                    reader.readAsText(file);
                });
                
                // Read CSS files
                cssFiles.forEach((file, index) => {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        cssContents[index] = {
                            name: file.name,
                            content: e.target.result
                        };
                        
                        // Check if all files have been read
                        if (htmlContents.length === htmlFiles.length && 
                            htmlContents.every(fc => fc !== undefined) &&
                            cssContents.length === cssFiles.length) {
                            processAllFiles(htmlContents, cssContents);
                        }
                    };
                    
                    reader.onerror = function() {
                        showError('Error reading file: ' + file.name);
                        spinner.style.display = 'none';
                    };
                    
                    readers.push(reader);
                    reader.readAsText(file);
                });
                
                // If no files to read, process immediately
                if (htmlFiles.length === 0 && cssFiles.length === 0) {
                    processAllFiles([], []);
                }
            }
            
            function processAllFiles(htmlContents, cssContents) {
                try {
                    // Extract and combine content from all files
                    const { htmlFiles, combinedCss, combinedJs } = separateContentFromMultipleFiles(htmlContents, cssContents);
                    
                    // Update labels based on number of files
                    updateLabels(htmlContents.length, cssContents.length, combinedCss, combinedJs);
                    
                    // Display the content
                    cssPreview.textContent = combinedCss || 'No CSS content found';
                    jsPreview.textContent = combinedJs || 'No JavaScript content found';
                    
                    // Create HTML file previews and download links
                    createHtmlFilePreviews(htmlFiles);
                    
                    // Create combined CSS and JS download links
                    createCombinedDownloadLinks(combinedCss, combinedJs);
                    
                    // Enable/disable buttons based on content availability
                    toggleButtons(combinedCss, combinedJs);
                    
                    // Show results
                    results.style.display = 'block';
                } catch (error) {
                    showError('Error processing files: ' + error.message);
                } finally {
                    spinner.style.display = 'none';
                }
            }
            
            function updateLabels(htmlFileCount, cssFileCount, cssContent, jsContent) {
                const hasCss = cssContent && cssContent !== 'No CSS content found';
                const hasJs = jsContent && jsContent !== 'No JavaScript content found';
                
                // Update CSS labels
                if (!hasCss) {
                    cssHeading.textContent = 'CSS';
                    downloadCssText.textContent = 'Download CSS';
                } else if (htmlFileCount + cssFileCount <= 1) {
                    if (cssFileCount === 1) {
                        cssHeading.textContent = 'CSS from File';
                        downloadCssText.textContent = 'Download CSS';
                    } else {
                        cssHeading.textContent = 'Extracted CSS';
                        downloadCssText.textContent = 'Download CSS';
                    }
                } else {
                    cssHeading.textContent = 'Combined CSS';
                    downloadCssText.textContent = 'Download Combined CSS';
                }
                
                // Update JS labels
                if (!hasJs) {
                    jsHeading.textContent = 'JavaScript';
                    downloadJsText.textContent = 'Download JavaScript';
                } else if (htmlFileCount <= 1) {
                    jsHeading.textContent = 'Extracted JavaScript';
                    downloadJsText.textContent = 'Download JavaScript';
                } else {
                    jsHeading.textContent = 'Combined JavaScript';
                    downloadJsText.textContent = 'Download Combined JavaScript';
                }
            }
            
            function separateContentFromMultipleFiles(htmlContents, cssContents) {
                let combinedCss = '';
                let combinedJs = '';
                const htmlFiles = [];
                
                // Add CSS from uploaded CSS files first
                cssContents.forEach(cssFile => {
                    combinedCss += `/* CSS from file: ${cssFile.name} */\n` + cssFile.content + '\n\n';
                });
                
                // Process HTML files
                htmlContents.forEach(htmlFile => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlFile.content, 'text/html');
                    
                    // Extract CSS from <style> tags
                    const styleElements = doc.querySelectorAll('style');
                    styleElements.forEach(style => {
                        combinedCss += `/* CSS from HTML: ${htmlFile.name} */\n` + style.textContent + '\n\n';
                        style.remove();
                    });
                    
                    // Extract JS from <script> without src
                    const scriptElements = doc.querySelectorAll('script:not([src])');
                    scriptElements.forEach(script => {
                        combinedJs += `// JavaScript from ${htmlFile.name}\n` + script.textContent + '\n\n';
                        script.remove();
                    });
                    
                    // Remove existing CSS links to avoid conflicts
                    const existingCssLinks = doc.querySelectorAll('link[rel="stylesheet"]');
                    existingCssLinks.forEach(link => {
                        if (!link.href.includes('style.css')) {
                            link.remove();
                        }
                    });
                    
                    // Add link to combined CSS file if we have any CSS
                    if (combinedCss.trim() && !doc.querySelector('link[href="style.css"]')) {
                        const link = doc.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = 'style.css';
                        doc.head.appendChild(link);
                    }
                    
                    // Add script tag for combined JS if we have any JS
                    if (combinedJs.trim() && !doc.querySelector('script[src="script.js"]')) {
                        const script = doc.createElement('script');
                        script.src = 'script.js';
                        script.defer = true;
                        doc.body.appendChild(script);
                    }
                    
                    // Get the html string
                    let htmlString = doc.documentElement.outerHTML;
                    
                    // Add doctype if not present
                    if (!htmlString.toUpperCase().startsWith('<!DOCTYPE')) {
                        htmlString = '<!DOCTYPE html>\n' + htmlString;
                    }
                    
                    htmlFiles.push({
                        name: htmlFile.name,
                        content: htmlString.trim()
                    });
                });
                
                return {
                    htmlFiles,
                    combinedCss: combinedCss.trim(),
                    combinedJs: combinedJs.trim()
                };
            }
            
            function toggleButtons(css, js) {
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
            
            function createHtmlFilePreviews(htmlFiles) {
                htmlFilePreviews.innerHTML = '';
                htmlFileLinks.innerHTML = '';
                
                if (htmlFiles.length === 0) {
                    htmlFilePreviews.innerHTML = '<div class="no-html-message">No HTML files were processed</div>';
                    return;
                }
                
                // Create previews for each HTML file
                htmlFiles.forEach((htmlFile, index) => {
                    const previewId = `html-preview-${index}`;
                    
                    // Create preview container
                    const previewContainer = document.createElement('div');
                    previewContainer.className = 'html-file-preview';
                    
                    // Create preview header
                    const previewHeader = document.createElement('div');
                    previewHeader.className = 'html-file-preview-header';
                    
                    const title = document.createElement('h4');
                    title.textContent = htmlFile.name;
                    
                    const copyButton = document.createElement('button');
                    copyButton.type = 'button';
                    copyButton.className = 'btn-clipboard';
                    copyButton.setAttribute('data-target', previewId);
                    copyButton.setAttribute('aria-label', `Copy ${htmlFile.name} content`);
                    
                    // Add SVG icons to copy button
                    copyButton.innerHTML = `
                        <svg class="clipboard-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"></path>
                            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"></path>
                        </svg>
                        <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"></path>
                        </svg>
                    `;
                    
                    previewHeader.appendChild(title);
                    previewHeader.appendChild(copyButton);
                    
                    // Create preview content
                    const previewContent = document.createElement('div');
                    previewContent.className = 'html-file-preview-content';
                    previewContent.id = previewId;
                    previewContent.textContent = htmlFile.content;
                    
                    // Assemble preview container
                    previewContainer.appendChild(previewHeader);
                    previewContainer.appendChild(previewContent);
                    
                    // Add to the previews container
                    htmlFilePreviews.appendChild(previewContainer);
                    
                    // Create download link
                    const link = document.createElement('a');
                    link.className = 'html-file-link';
                    link.textContent = htmlFile.name;
                    
                    const blob = new Blob([htmlFile.content], { type: 'text/html' });
                    link.href = URL.createObjectURL(blob);
                    link.download = htmlFile.name;
                    
                    htmlFileLinks.appendChild(link);
                });
            }
            
            function createCombinedDownloadLinks(css, js) {
                // Create blobs and URLs for CSS only if there's CSS content
                if (css !== 'No CSS content found') {
                    const cssBlob = new Blob([css], { type: 'text/css' });
                    downloadCss.href = URL.createObjectURL(cssBlob);
                    downloadCss.download = 'style.css';
                }
                
                // Create blobs and URLs for JS only if there's JS content
                if (js !== 'No JavaScript content found') {
                    const jsBlob = new Blob([js], { type: 'text/javascript' });
                    downloadJs.href = URL.createObjectURL(jsBlob);
                    downloadJs.download = 'script.js';
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
                fileList.innerHTML = '';
            }
        });
