"use strict";
// function generateURLs(baseURL, start, end, step) {
//     const urls = [];
//     for (let i = start; i <= end; i++) {
//         const url = `${baseURL}${i}.ts`;
//         urls.push(url);
//     }
//     return urls;
// }




document.addEventListener('DOMContentLoaded', function () {
    var clipboardPasteIconStart = document.getElementById('clipbaord-start-paste');
    var clipboardPasteIconEnd = document.getElementById('clipbaord-end-paste');
    var clipboardDeleteIconStart = document.getElementById('clipbaord-start-delete');
    var clipboardDeleteIconEnd = document.getElementById('clipbaord-end-delete');
    var inputFieldStart = document.getElementById('startBaseURL');
    var inputFieldEnd = document.getElementById('endBaseURL');

    clipboardPasteIconStart.addEventListener('click', function () {
        // Execute paste operation
        navigator.clipboard.readText()
            .then(text => {
                // Paste clipboard content into the input field
                inputFieldStart.value = text;
            })
            .catch(err => {
                console.error('Failed to read clipboard contents: ', err);
            });
    });

    clipboardPasteIconEnd.addEventListener('click', function () {
        // Execute paste operation
        navigator.clipboard.readText()
            .then(text => {
                // Paste clipboard content into the input field
                inputFieldEnd.value = text;
            })
            .catch(err => {
                console.error('Failed to read clipboard contents: ', err);
            });
    });


    clipboardDeleteIconStart.addEventListener('click', function () {
        // Execute paste operation
        inputFieldStart.value="";
    });
    clipboardDeleteIconEnd.addEventListener('click', function () {
        // Execute paste operation
        inputFieldEnd.value="";
    });


});


function generateSequenceURLs(api1, api2) {
    // Find the common prefix of both URLs
    let i = 0;
    while (i < api1.length && i < api2.length && api1[i] === api2[i]) {
        i++;
    }
    const commonPrefix = api1.substring(0, i);

    // Extract the unmatched parts of the URLs
    const unmatchedPart1 = api1.substring(i);
    const unmatchedPart2 = api2.substring(i);

    // Extract numbers from the unmatched parts of the URLs
    const regex = /\d+/g;
    const numbers1 = unmatchedPart1.match(regex).map(Number);
    const numbers2 = unmatchedPart2.match(regex).map(Number);

    // Determine the range of numbers
    const minNumber = Math.min(...numbers1, ...numbers2);
    const maxNumber = Math.max(...numbers1, ...numbers2);

    var minRange = minNumber;
    var maxRange = maxNumber;

    // Generate sequence of URLs
    const urls = [];
    var count=0;
    for (let j = minNumber; j <= maxNumber; j++) {
        urls.push(`${commonPrefix}${j}.ts`);
        count++;
    }
    document.getElementById("baseURL").value = commonPrefix;
    document.getElementById("startRange").value = parseInt(minRange);
    document.getElementById("endRange").value = parseInt(maxRange);
    document.querySelector(".request-info").textContent = `${count} Request`;

    return urls;
}

// // Example usage
// const api1 = "https://appx-transcoded-videos.livelearn.in/videos/amansirenglish-data/326275-1704649439/hls-3ee5f3/360p/master-9035112.9658090960.ts";
// const api2 = "https://appx-transcoded-videos.livelearn.in/videos/amansirenglish-data/326275-1704649439/hls-3ee5f3/360p/master-9035112.96580909647.ts";

// const sequenceURLs = generateSequenceURLs(api1, api2);
// console.log(sequenceURLs);


function fetchAndSaveData(url, index) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch data from ${url}`);
            }
            return response.arrayBuffer();
        })
        .then(data => {
            return {
                index: index,
                data: data
            };
        });
}

function mergeBlobs(blobArray) {
    return new Blob(blobArray, {
        type: 'video/mp4'
    });
}

function saveBlobToFile(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function fetchAndMerge() {
    const startRangeURL = document.getElementById("startBaseURL").value;
    const endRangeURL = document.getElementById("endBaseURL").value;
    //const step = 47; // Change this to the step you need

    //const urls = generateURLs(baseURL, startRange, endRange, step);
    const urls = generateSequenceURLs(startRangeURL, endRangeURL);

    const promises = urls.map((url, index) => fetchAndSaveData(url, index + 1));

    Promise.all(promises)
        .then(results => {
            const blobs = results.sort((a, b) => a.index - b.index).map(result => new Blob([result.data]));
            const mergedBlob = mergeBlobs(blobs);
            saveBlobToFile(mergedBlob, "merged.mp4");
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

document.getElementById("downloadButton").addEventListener("click", fetchAndMerge);
