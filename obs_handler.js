const intervalMS = 5000;
const baseFolder = "C:\\Users\\Jack\\Videos\\record";

function retrieve_with_tv_bell() {
    let title;
    for (const span of document.querySelectorAll("div.text>span")) {
        if (span.innerHTML !== '') {
            title = span.innerHTML.replace("&nbsp;", " ").replace("•", "");
        }
    }
    return title;
}

function main(websocket) {
    let videoSrc = document.getElementsByTagName("video")[0].src;
    let videoTitle;
    if (videoSrc.includes('tv.bell')) {
        videoTitle = retrieve_with_tv_bell();
    }
    if (videoTitle) {
        const videoFolder = baseFolder + "\\" + videoTitle;
        websocket.sendCallback('SetRecordingFolder', {'rec-folder': videoFolder}, (error) => {
        });
        websocket.sendCallback('StartRecording', (error) => {
        });
    }
    let restart = setInterval(function() {
        let newVideoSrc = document.getElementsByTagName("video")[0].src;
        if (newVideoSrc !== videoSrc) {
            websocket.sendCallback('StopRecording', (error) => {
            });
            clearInterval(restart);
            main()
        }
    }, intervalMS);
}

await new Promise(r => setTimeout(r, 10000));
const obs = new OBSWebSocket();
obs.connect({ address: 'localhost:4444' }, (error) => {
    console.log(error);
});
obs.on("ConnectionOpened", () => {
    main(obs);

});