let intervalMS = 5000;
let baseFolder = "C:\\Users\\Jack\\Videos\\record";
let host = "localhost:4444";

function get_media_name() {
	for (const i of document.getElementsByTagName("title")) {
		if (i.innerText.indexOf('Prime Video') > -1) {
			return 'PrimeVideo';
		} else if (i.innerHTML.indexOf('Télé Fibe') > -1) {
			return 'TvBell';
		} else {
			
		}
	}
}
function get_video_title()  {
	const media_name = get_media_name();
	if (media_name === 'TvBell') {
		let title;
		for (const span of document.querySelectorAll("div.text>span")) {
			if (span.innerHTML !== '') {
				title = span.innerHTML.replace("&nbsp;", " ").replace("•", "");
			}
		}
		return title;
	} else if (media_name === 'PrimeVideo') {
		return document.querySelector(".webPlayerUIContainer>div>div>div:nth-child(2)>div>div:nth-child(3)>div>div>h1").innerText + " " + document.querySelector(".webPlayerUIContainer>div>div>div:nth-child(2)>div>div:nth-child(3)>div>div>h2").innerText;
	}
}
function get_video_src() {
	const media_name = get_media_name();
	if (media_name === 'TvBell') {
		return document.getElementsByTagName("video")[0].src;
	} else if (media_name === 'PrimeVideo') {
		for (const i of document.getElementsByTagName("video")) {
			if (i.src.indexOf("blob:https://www.primevideo.com") > -1) {
				return i.src;
			}
		}
	}
}
async function check_if_change(websocket) {
	let src = get_video_src()
	let restart = setInterval(function() {
		let newSrc = get_video_src();
		if (newSrc !== src) {
			console.log("changement de video...")
			src = newSrc;
			websocket.sendCallback('StopRecording', async (error) => {				
				clearInterval(restart);
				await new Promise(r => setTimeout(r, 2000));
				main(websocket);
			});
		}
	}, intervalMS);
}

async function main(websocket) {
	const videoTitle = get_video_title();
	if (videoTitle) {
		const videoFolder = baseFolder + "\\" + videoTitle;
		
		websocket.sendCallback('SetRecordingFolder', {'rec-folder': videoFolder}, (error) => {
			console.log(error);
		});
		websocket.sendCallback('StartRecording', (error) => {
			console.log(error);
		});
		
		await check_if_change(websocket);
	} else {
		console.log("Aucun titre");
	}

}

let obs = new OBSWebSocket();
obs.connect({ address: 'localhost:4444' }, (error) => {
    console.log(error);
});
obs.on("ConnectionOpened", () => {
    main(obs);

});
