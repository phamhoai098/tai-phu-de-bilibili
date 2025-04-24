// ==UserScript==
// @name         Tải Phụ Đề BiliBili
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Tải xuống phụ đề từ video Bilibili bằng tính năng trợ lý AI và nhấp vào danh sách phụ đề
// @author       phamhoai098
// @icon         https://www.google.com/s2/favicons?domain=biliintl.com
// @match        https://www.bilibili.com/video/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Wait for the video page to fully load before adding our button
    window.addEventListener('load', function() {
        // Add a small delay to ensure all elements are loaded
        setTimeout(addDownloadButton, 2000);
    });

    // Function to add our download button to the page
    function addDownloadButton() {
        // Check if our button already exists to avoid duplicates
        if (document.querySelector('#subtitle-download-container')) {
            return;
        }

        // Create a floating button container
        const downloadContainer = document.createElement('div');
        downloadContainer.id = 'subtitle-download-container';
        downloadContainer.style.position = 'fixed';
        downloadContainer.style.left = '0';
        downloadContainer.style.top = '50%';
        downloadContainer.style.transform = 'translateY(-50%)';
        downloadContainer.style.backgroundColor = 'rgba(251, 114, 153, 0.7)'; // Bilibili pink with transparency
        downloadContainer.style.color = 'white';
        downloadContainer.style.padding = '5px 8px'; // 50% of original padding
        downloadContainer.style.borderRadius = '0 4px 4px 0';
        downloadContainer.style.cursor = 'pointer';
        downloadContainer.style.zIndex = '999';
        downloadContainer.style.display = 'flex';
        downloadContainer.style.alignItems = 'center';
        downloadContainer.style.boxShadow = '2px 2px 10px rgba(0, 0, 0, 0.2)';
        downloadContainer.style.transition = 'all 0.3s ease';
        downloadContainer.style.fontSize = '12px'; // Smaller font size

        // Create the icon element
        const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        iconSvg.setAttribute('width', '10'); // 50% of original size
        iconSvg.setAttribute('height', '10'); // 50% of original size
        iconSvg.setAttribute('viewBox', '0 0 24 24');
        iconSvg.setAttribute('fill', 'none');
        iconSvg.style.marginRight = '4px'; // 50% of original margin
        iconSvg.id = 'subtitle-download-icon';

        // Add SVG content for a download icon
        iconSvg.innerHTML = `
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C12.5523 4 13 4.44772 13 5V13.5858L15.2929 11.2929C15.6834 10.9024 16.3166 10.9024 16.7071 11.2929C17.0976 11.6834 17.0976 12.3166 16.7071 12.7071L12.7071 16.7071C12.3166 17.0976 11.6834 17.0976 11.2929 16.7071L7.29289 12.7071C6.90237 12.3166 6.90237 11.6834 7.29289 11.2929C7.68342 10.9024 8.31658 10.9024 8.70711 11.2929L11 13.5858V5C11 4.44772 11.4477 4 12 4ZM4 14C4.55228 14 5 14.4477 5 15V17C5 17.5523 5.44772 18 6 18H18C18.5523 18 19 17.5523 19 17V15C19 14.4477 19.4477 14 20 14C20.5523 14 21 14.4477 21 15V17C21 18.6569 19.6569 20 18 20H6C4.34315 20 3 18.6569 3 17V15C3 14.4477 3.44772 14 4 14Z" fill="white"/>
        `;

        // Add the icon to the container
        downloadContainer.appendChild(iconSvg);

        // Add text label
        const textLabel = document.createElement('span');
        textLabel.textContent = 'TẢI PHỤ ĐỀ';
        textLabel.style.fontSize = '12px'; // 50% of original font size
        textLabel.id = 'subtitle-download-text';
        downloadContainer.appendChild(textLabel);

        // Add click event to the container
        downloadContainer.addEventListener('click', extractAndDownloadSubtitles);

        // Add the button to the body
        document.body.appendChild(downloadContainer);

        console.log('Đã thêm nút tải xuống phụ đề thành công');
    }

    // Function to extract and download subtitles
    function extractAndDownloadSubtitles() {
        console.log('Trích xuất phụ đề...');

        // Show a loading indicator
        const downloadContainer = document.querySelector('#subtitle-download-container');
        const textLabel = document.querySelector('#subtitle-download-text');
        const originalText = textLabel.textContent;
        textLabel.textContent = 'Đang tải...';

        // Store original color and set loading color
        const originalColor = downloadContainer.style.backgroundColor;
        downloadContainer.style.backgroundColor = 'rgba(251, 114, 153, 0.9)'; // More opaque while loading

        // Create loading animation - small dot that pulses
        const loadingDot = document.createElement('span');
        loadingDot.textContent = ' •';
        loadingDot.style.animation = 'pulse 1s infinite';
        loadingDot.id = 'loading-dot';
        textLabel.appendChild(loadingDot);

        // Add the keyframe animation to the document
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes pulse {
                0% { opacity: 0.2; }
                50% { opacity: 1; }
                100% { opacity: 0.2; }
            }
        `;
        document.head.appendChild(style);

        // Find and click the AI assistant button to open the panel
        const aiAssistantContainer = document.querySelector('.video-ai-assistant');
        if (aiAssistantContainer) {
            aiAssistantContainer.click(); // Open the AI assistant panel

            // Wait for AI assistant panel to load
            setTimeout(() => {
                try {
                    // Find and click the subtitle list button
                    const subtitleListButton = findSubtitleListButton();
                    if (!subtitleListButton) {
                        alert('Không tìm thấy nút "Danh sách phụ đề", vui lòng đảm bảo bảng điều khiển Trợ lý AI được tải đúng cách');
                        downloadContainer.style.backgroundColor = originalColor;
                        textLabel.textContent = originalText;

                        // Remove loading dot
                        const loadingDot = document.querySelector('#loading-dot');
                        if (loadingDot) loadingDot.remove();

                        // Close the AI panel
                        const closeButton = document.querySelector('.close-btn');
                        if (closeButton) closeButton.click();
                        return;
                    }

                    console.log('Tìm nút danh sách phụ đề và nhấp vào nó...');
                    subtitleListButton.click();

                    // Wait for subtitles to load after clicking the subtitle list button
                    setTimeout(() => {
                        try {
                            // Find all subtitle text spans
                            const subtitleItems = document.querySelectorAll('._Text_1iu0q_64');
                            if (!subtitleItems || subtitleItems.length === 0) {
                                // Try alternative selectors
                                console.log('Hãy thử sử dụng bộ chọn thay thế để tìm phụ đề...');
                                downloadSubtitlesWithAlternativeSelectors(originalColor, downloadContainer, originalText);
                                return;
                            }

                            // Extract timestamps and subtitle text
                            let subtitles = [];
                            document.querySelectorAll('._Part_1iu0q_16').forEach(part => {
                                const timeElem = part.querySelector('._TimeText_1iu0q_35');
                                const textElem = part.querySelector('._Text_1iu0q_64');

                                if (timeElem && textElem) {
                                    subtitles.push(`${timeElem.textContent}: ${textElem.textContent}`);
                                }
                            });

                            // If no subtitles found, try alternative selectors
                            if (subtitles.length === 0) {
                                console.log('Không tìm thấy phụ đề qua bộ chọn chính, đang thử bộ chọn thay thế...');
                                downloadSubtitlesWithAlternativeSelectors(originalColor, downloadContainer, originalText);
                                return;
                            }

                            // Save the subtitles to file
                            saveSubtitlesToFile(subtitles, originalColor, downloadContainer, originalText);

                        } catch (error) {
                            console.error('Lỗi khi tải phụ đề:', error);
                            downloadContainer.style.backgroundColor = originalColor;
                            textLabel.textContent = originalText;

                            // Remove loading dot
                            const loadingDot = document.querySelector('#loading-dot');
                            if (loadingDot) loadingDot.remove();

                            // Close the AI panel
                            const closeButton = document.querySelector('.close-btn');
                            if (closeButton) closeButton.click();
                        }
                    }, 2000); // Wait 2 seconds for subtitles to load after clicking subtitle list
                } catch (error) {
                    console.error('Lỗi khi nhấp vào nút danh sách phụ đề:', error);
                    downloadContainer.style.backgroundColor = originalColor;
                    textLabel.textContent = originalText;

                    // Remove loading dot
                    const loadingDot = document.querySelector('#loading-dot');
                    if (loadingDot) loadingDot.remove();

                    // Close the AI panel
                    const closeButton = document.querySelector('.close-btn');
                    if (closeButton) closeButton.click();
                }
            }, 2000); // Wait 2 seconds for AI assistant panel to load
        } else {
            alert('Không tìm thấy nút trợ lý AI, vui lòng đảm bảo bạn đang ở trang video Bilibili');
            downloadContainer.style.backgroundColor = originalColor;
            textLabel.textContent = originalText;

            // Remove loading dot
            const loadingDot = document.querySelector('#loading-dot');
            if (loadingDot) loadingDot.remove();
        }
    }

    // Function to find the subtitle list button
    function findSubtitleListButton() {
        // First try with the class mentioned in the user's message
        const buttonByClass = document.querySelector('span._Label_krx6h_18');
        if (buttonByClass && buttonByClass.textContent === '字幕列表') {
            return buttonByClass;
        }

        // Try with general selectors and text content
        const allLabels = [
            ...document.querySelectorAll('span[class*="Label"]'),
            ...document.querySelectorAll('div[class*="Label"]'),
            ...document.querySelectorAll('button[class*="Label"]'),
            ...document.querySelectorAll('span'),
            ...document.querySelectorAll('button')
        ];

        for (const element of allLabels) {
            if (element.textContent.includes('字幕列表')) {
                return element;
            }
        }

        // As a last resort, try to find elements with certain classes that might contain the subtitle list button
        const panelElements = document.querySelectorAll('[class*="panel"], [class*="container"], [class*="ai"]');
        for (const panel of panelElements) {
            const children = panel.querySelectorAll('*');
            for (const child of children) {
                if (child.textContent === '字幕列表') {
                    return child;
                }
            }
        }

        return null;
    }

    // Function to try alternative selectors for finding subtitles
    function downloadSubtitlesWithAlternativeSelectors(originalColor, downloadContainer, originalText) {
        console.log('Trích xuất phụ đề bằng cách sử dụng bộ chọn thay thế...');
        let subtitles = [];

        // Try different selectors that might contain subtitle content
        // Method 1: Look for elements with time-like text and adjacent text
        document.querySelectorAll('[class*="time"], [class*="Time"]').forEach(timeElem => {
            // Check if it has time format (00:00)
            if (/^\d+:\d+$/.test(timeElem.textContent.trim())) {
                // Find the closest text element (usually a sibling or parent's child)
                let textElem = timeElem.nextElementSibling;
                if (textElem) {
                    subtitles.push(`${timeElem.textContent}: ${textElem.textContent}`);
                }
            }
        });

        // Method 2: Look for container elements that might have both time and text
        document.querySelectorAll('[class*="subtitle"], [class*="Subtitle"], [class*="Part"], [class*="part"], [class*="Line"], [class*="line"]').forEach(container => {
            const children = container.children;
            if (children.length >= 2) {
                const firstChild = children[0];
                const secondChild = children[1];

                // Check if first child might be a timestamp
                if (firstChild && /^\d+:\d+$/.test(firstChild.textContent.trim())) {
                    subtitles.push(`${firstChild.textContent}: ${secondChild.textContent}`);
                }
            }
        });

        // Method 3: Look at all spans for timestamp-like content
        const allSpans = document.querySelectorAll('span');
        for (let i = 0; i < allSpans.length; i++) {
            const span = allSpans[i];
            if (/^\d+:\d+$/.test(span.textContent.trim()) && allSpans[i+1]) {
                subtitles.push(`${span.textContent}: ${allSpans[i+1].textContent}`);
            }
        }

        // Check if we found any subtitles
        if (subtitles.length === 0) {
            // Last resort: grab any text that might be subtitle content
            const allText = document.querySelectorAll('[class*="text"], [class*="Text"], [class*="content"], [class*="Content"]');
            allText.forEach(elem => {
                if (elem.textContent.length > 0 && !subtitles.includes(elem.textContent)) {
                    subtitles.push(elem.textContent);
                }
            });
        }

        // If still no subtitles found
        if (subtitles.length === 0) {
            alert('Không thể trích xuất phụ đề, vui lòng thử làm mới trang và thử lại');
            downloadContainer.style.backgroundColor = originalColor;

            // Update button text back to original
            const textLabel = document.querySelector('#subtitle-download-text');
            if (textLabel) textLabel.textContent = originalText;

            // Remove loading dot
            const loadingDot = document.querySelector('#loading-dot');
            if (loadingDot) loadingDot.remove();

            // Close the AI panel
            const closeButton = document.querySelector('.close-btn');
            if (closeButton) closeButton.click();

            return;
        }

        // Save the subtitles to file
        saveSubtitlesToFile(subtitles, originalColor, downloadContainer, originalText);
    }

    // Function to save subtitles to a file
    function saveSubtitlesToFile(subtitles, originalColor, downloadContainer, originalText) {
        try {
            // Remove duplicates
            subtitles = [...new Set(subtitles)];

            // Create the subtitle content
            const subtitleContent = subtitles.join('\n');

            // Copy to clipboard
            navigator.clipboard.writeText(subtitleContent).then(function() {
                // Get the position of the download button
                const buttonRect = downloadContainer.getBoundingClientRect();

                // Update button text back to original
                const textLabel = document.querySelector('#subtitle-download-text');
                if (textLabel) textLabel.textContent = originalText;

                // Remove loading dot
                const loadingDot = document.querySelector('#loading-dot');
                if (loadingDot) loadingDot.remove();

                // Create and show a temporary notification
                const notification = document.createElement('div');
                notification.textContent = 'Phụ đề đã được sao chép vào clipboard';
                notification.style.position = 'fixed';
                notification.style.top = `${buttonRect.top}px`;
                notification.style.left = `${buttonRect.right + 10}px`; // 10px to the right of the button
                notification.style.padding = '5px 10px';
                notification.style.backgroundColor = '#fb7299'; // Bilibili pink color
                notification.style.color = 'white';
                notification.style.borderRadius = '4px';
                notification.style.zIndex = '9999';
                notification.style.fontSize = '12px';
                notification.style.boxShadow = '2px 2px 10px rgba(0, 0, 0, 0.2)';
                notification.style.whiteSpace = 'nowrap';

                document.body.appendChild(notification);

                // Remove the notification after 1.5 seconds
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 1500);

                console.log(`Đã sao chép thành công ${subtitles.length} dòng phụ đề vào clipboard`);
            }).catch(function(error) {
                console.error('Lỗi khi sao chép vào clipboard:', error);
                alert('Sao chép vào clipboard không thành công, vui lòng kiểm tra quyền của trình duyệt');

                // Update button text back to original
                const textLabel = document.querySelector('#subtitle-download-text');
                if (textLabel) textLabel.textContent = originalText;

                // Remove loading dot
                const loadingDot = document.querySelector('#loading-dot');
                if (loadingDot) loadingDot.remove();
            }).finally(function() {
                // Close the AI panel
                const closeButton = document.querySelector('.close-btn');
                if (closeButton) closeButton.click();

                // Reset button color
                downloadContainer.style.backgroundColor = originalColor;
            });
        } catch (error) {
            console.error('Lỗi xử lý phụ đề:', error);
            downloadContainer.style.backgroundColor = originalColor;

            // Update button text back to original
            const textLabel = document.querySelector('#subtitle-download-text');
            if (textLabel) textLabel.textContent = originalText;

            // Remove loading dot
            const loadingDot = document.querySelector('#loading-dot');
            if (loadingDot) loadingDot.remove();

            // Close the AI panel
            const closeButton = document.querySelector('.close-btn');
            if (closeButton) closeButton.click();
        }
    }
})();
