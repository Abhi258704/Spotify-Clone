
console.log('JS is runnin');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinSec(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`; // Ensures 2-digit seconds
}


async function getSongs(folder) {
    try {
        currFolder = folder;
        let response = await fetch(`/${folder}/`);
        let html = await response.text();

        let div = document.createElement("div");
        div.innerHTML = html;
        let anchors = div.getElementsByTagName("a");

        songs = [];
        for (let a of anchors) {
            if (a.href.endsWith(".mp3")) {
                songs.push(a.href.split(`/${folder}/`)[1]);
            }
        }

        // Get the folder cover image path
        let coverImage = `/${folder}/cover.jpeg`; // Default path
        
        // Try to fetch album info if available
        try {
            let infoResponse = await fetch(`/${folder}/info.json`);
            let info = await infoResponse.json();
            if (info.cover) {
                coverImage = `/${folder}/${info.cover}`;
            }
        } catch (e) {
            console.log("No info.json found, using default cover");
        }

        let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";
        for (const song of songs) {
            songUL.innerHTML += `
                <li data-song="${song}"> 
                    <img class="ml" src="${coverImage}" alt="Album cover">
                    <div class="info">
                        <div>${decodeURIComponent(song).replace('.mp3', '')}</div>
                        <div>BabyCoder</div>
                    </div>
                    <div>Play now</div>
                    <img class="slp" src="images/play.svg" alt="Play">
                </li>`;
        }

        // Add event listeners
        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                let track = e.getAttribute("data-song");
                playMusic(track);
            });
        });

        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

const playMusic = (track, pause = false) => {

    // Remove playing class from all li elements
    document.querySelectorAll('.songList ul li').forEach(li => {
        li.classList.remove('playing');
    });
    
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        pl.src = "images/pause.svg"
    }


     // Add playing class to the current song's li
    const currentLi = document.querySelector(`.songList ul li[data-song="${track}"]`);
    if (currentLi) {
        currentLi.classList.add('playing');
    }


    let formattedTrackName = decodeURIComponent(track)
        .replace(".mp3", "")       // Remove ".mp3"
        .replace(/%20/g, " ")      // Replace "%20" with spaces
        .replace(/-/g, " - ");

    document.querySelector(".songinfo").innerHTML = formattedTrackName
    document.querySelector(".songtime").innerHTML = "00 : 00 /..."

    // Wait for audio metadata to be ready
    currentSong.addEventListener("loadedmetadata", () => {
        const totalDuration = secondsToMinSec(currentSong.duration);
        document.querySelector(".songtime").innerHTML = `00:00 / ${totalDuration}`;
    }, { once: true }); // only run once per song change

}

async function displayAlbums() {
    try {
        let response = await fetch(`/songs/`);
        let html = await response.text();
        let div = document.createElement("div");
        div.innerHTML = html;
        let anchors = div.getElementsByTagName("a");
        let cards = document.querySelector(".cards");

        // Clear existing cards first
        cards.innerHTML = "";

        for (let e of Array.from(anchors)) {
            if (e.href.includes("/songs")) {
                let parts = e.href.split('/').filter(part => part !== '');
                let songsIndex = parts.indexOf('songs');
                if (songsIndex !== -1 && parts.length > songsIndex + 1) {
                    let folder = parts[songsIndex + 1];

                    try {
                        let response = await fetch(`/songs/${folder}/info.json`);
                        let r = await response.json();

                        // Use dynamic folder name in data attribute
                        cards.innerHTML += `<div data-folder="${folder}" class="card-s">
                            <div class="play">
                                <img src="images/play2.svg" alt="">
                            </div>
                            <img src="/songs/${folder}/cover.jpeg" alt="">
                            <h4>${r.title}</h4>
                            <p>${r.description}</p>
                        </div>`;
                    } catch (error) {
                        console.error(`Error loading info for ${folder}:`, error);
                    }
                }
            }
        }

        // Add event listeners after all cards are created
        Array.from(document.getElementsByClassName("card-s")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0]); // Auto-play first song
            });
        });
    } catch (error) {
        console.error("Error displaying albums:", error);
    }
}

async function main() {

    currentSong.volume = 0.5;
    document.querySelector(".vball").style.left = "50%";

    songs = await getSongs("songs/ncs");
    playMusic(songs[0], true)


    displayAlbums();


    //  event listnere for buttons

    pl.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            pl.src = "images/pause.svg"
        }
        else {
            currentSong.pause()
            pl.src = "images/play-button-svgrepo-com.svg"
        }
    })
    //  event listnere for time

    currentSong.addEventListener('timeupdate', () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinSec(currentSong.currentTime)} / ${secondsToMinSec(currentSong.duration)}`;
        document.querySelector(".ball").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })
    //  event listnere for time

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".ball").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
    //  event listnere for hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".s1").style.left = "0"
    })
    document.querySelector(".hc").addEventListener("click", () => {
        document.querySelector(".s1").style.left = "-120%"
    })

    //  event listnere for next
    n.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    });

    // Update previous button handler
    p.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        } else {
            playMusic(songs[0]);
        }
    });

    //  event listnere for next

    document.querySelector(".vbar").addEventListener("click", e => {
        let barWidth = e.target.getBoundingClientRect().width;
        let clickX = e.offsetX;

        // Calculate percentage
        let percent = (clickX / barWidth) * 100;
        let volume = Math.min(Math.max(percent / 100, 0), 1); // Clamp between 0 and 1

        // Move the visual indicator
        document.querySelector(".vball").style.left = percent + "%";

        // Set the actual volume
        currentSong.volume = volume;

        currentSong.muted = (volume === 0);

    })


    volume.addEventListener("click", e => {
        if (currentSong.muted || currentSong.volume === 0) {
            // Unmute
            currentSong.muted = false;
            currentSong.volume = 0.5; // or store previous volume if needed
            volume.src = "images/volume-loud-svgrepo-com.svg";
            document.querySelector(".vball").style.left = "50%";
        } else {
            // Mute
            currentSong.muted = true;
            volume.src = "images/volume-cross-svgrepo-com.svg";
            document.querySelector(".vball").style.left = "0%";
        }
    })





}

main()

