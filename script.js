console.log('JS is running');

const BASE_URL = "https://https://marvelous-dragon-7a4b5e.netlify.app/";

let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinSec(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

async function getSongs(folder) {
    try {
        currFolder = folder;
        
        // Static song list - update with your actual filenames
        songs = [
            "song1.mp3",
            "song2.mp3",
            "song3.mp3"
        ];

        let coverImage = `songs/${folder}/cover.jpeg`;
        
        try {
            let infoResponse = await fetch(`songs/${folder}/info.json`);
            let info = await infoResponse.json();
            if (info.cover) {
                coverImage = `songs/${folder}/${info.cover}`;
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

        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                let track = e.getAttribute("data-song");
                playMusic(track);
            });
        });

        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

const playMusic = (track, pause = false) => {
    document.querySelectorAll('.songList ul li').forEach(li => {
        li.classList.remove('playing');
    });
    
    currentSong.src = `songs/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play()
            .then(() => {
                pl.src = "images/pause.svg";
            })
            .catch(error => {
                console.error("Playback failed:", error);
            });
    }

    const currentLi = document.querySelector(`.songList ul li[data-song="${track}"]`);
    if (currentLi) {
        currentLi.classList.add('playing');
    }

    let formattedTrackName = decodeURIComponent(track)
        .replace(".mp3", "")
        .replace(/%20/g, " ")
        .replace(/-/g, " - ");

    document.querySelector(".songinfo").innerHTML = formattedTrackName;
    document.querySelector(".songtime").innerHTML = "00:00 / ...";

    currentSong.addEventListener("loadedmetadata", () => {
        const totalDuration = secondsToMinSec(currentSong.duration);
        document.querySelector(".songtime").innerHTML = `00:00 / ${totalDuration}`;
    }, { once: true });
}

async function displayAlbums() {
    try {
        // Static album data - update with your actual albums
        const albums = [
            {
                folder: "ncs",
                title: "NCS Releases",
                description: "No Copyright Sounds",
                cover: "cover.jpeg"
            }
        ];

        let cards = document.querySelector(".cards");
        cards.innerHTML = "";

        for (let album of albums) {
            cards.innerHTML += `
                <div data-folder="${album.folder}" class="card-s">
                    <div class="play">
                        <img src="images/play2.svg" alt="">
                    </div>
                    <img src="songs/${album.folder}/${album.cover}" alt="">
                    <h4>${album.title}</h4>
                    <p>${album.description}</p>
                </div>`;
        }

        Array.from(document.getElementsByClassName("card-s")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                if (songs.length > 0) {
                    playMusic(songs[0]);
                }
            });
        });
    } catch (error) {
        console.error("Error displaying albums:", error);
    }
}

async function main() {
    currentSong.volume = 0.5;
    document.querySelector(".vball").style.left = "50%";

    // Debug file access
    console.log("Testing file access...");
    const testFiles = [
        'songs/ncs/song1.mp3',
        'songs/ncs/cover.jpeg',
        'songs/ncs/info.json'
    ];
    
    for (const file of testFiles) {
        try {
            const response = await fetch(file);
            console.log(`${file} status: ${response.status}`);
        } catch (e) {
            console.error(`${file} error:`, e);
        }
    }

    songs = await getSongs("ncs");
    if (songs.length > 0) {
        playMusic(songs[0], true);
    } else {
        console.error("No songs found!");
    }

    displayAlbums();

    // Event listeners
    document.getElementById("pl").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play().then(() => {
                pl.src = "images/pause.svg";
            });
        } else {
            currentSong.pause();
            pl.src = "images/play-button-svgrepo-com.svg";
        }
    });

    document.getElementById("n").addEventListener("click", () => {
        if (!songs || songs.length === 0) return;
        let index = songs.indexOf(currentSong.src.split("/").pop());
        playMusic(songs[(index + 1) % songs.length]);
    });

    document.getElementById("p").addEventListener("click", () => {
        if (!songs || songs.length === 0) return;
        let index = songs.indexOf(currentSong.src.split("/").pop());
        playMusic(songs[(index - 1 + songs.length) % songs.length]);
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".ball").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".vbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".vball").style.left = percent + "%";
        currentSong.volume = Math.min(Math.max(percent / 100, 0), 1);
        currentSong.muted = (currentSong.volume === 0);
    });

    document.getElementById("volume").addEventListener("click", () => {
        if (currentSong.muted || currentSong.volume === 0) {
            currentSong.muted = false;
            currentSong.volume = 0.5;
            document.querySelector(".vball").style.left = "50%";
            volume.src = "images/volume-loud-svgrepo-com.svg";
        } else {
            currentSong.muted = true;
            document.querySelector(".vball").style.left = "0%";
            volume.src = "images/volume-cross-svgrepo-com.svg";
        }
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".s1").style.left = "0";
    });

    document.querySelector(".hc").addEventListener("click", () => {
        document.querySelector(".s1").style.left = "-120%";
    });
}

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", main);