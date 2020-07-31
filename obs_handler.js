let intervalMS = 5000;
// Where the video will be saved
let baseFolder = "C:\\Users\\Jack\\Videos\\record";

function retrieve_with_tv_bell() {
    let title;
    for (const span of document.querySelectorAll("div.text>span")) {
        if (span.innerHTML !== '') {
            title = span.innerHTML.replace("&nbsp;", " ").replace("•", "");
        }
    }
    return title;
}
async function check_if_change_on_bell(websocket, videoSrc) {
	let restart = setInterval(function() {
		let newVideoSrc = document.getElementsByTagName("video")[0].src;
		if (newVideoSrc !== videoSrc) {
			websocket.sendCallback('StopRecording', async (error) => {				
				clearInterval(restart);
				// used as a workaround in order to prevent conflict which
				// appear when StartRecording is called after StopRecording
				await new Promise(r => setTimeout(r, 2000));
				main(websocket);
			});
		}
	}, intervalMS);
}
async function main(websocket) {
    let videoSrc = document.getElementsByTagName("video")[0].src;
    let videoTitle;
	let media;
    if (videoSrc.includes('tv.bell')) {
        videoTitle = retrieve_with_tv_bell();
		media = "tvBell";
    }
    if (videoTitle) {
        const videoFolder = baseFolder + "\\" + videoTitle;

		websocket.sendCallback('SetRecordingFolder', {'rec-folder': videoFolder}, (error) => {
		});
		websocket.sendCallback('StartRecording', (error) => {
		console.log(error);
		});
    }
	if (media === "tvBell") {
		await check_if_change_on_bell(websocket, videoSrc);
	}
}


let obs = new OBSWebSocket();
obs.connect({ address: 'localhost:4444' }, (error) => {
    console.log(error);
});
obs.on("ConnectionOpened", () => {
    main(obs);

});