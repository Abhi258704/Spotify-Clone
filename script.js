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
        
        // Replace dynamic fetching with static list
        songs = [
            "song1.mp3",
            "song2.mp3",
            "song3.mp3",
            "song4.mp3",
            "song5.mp3"
        ];

        let coverImage = `${folder}/cover.jpeg`;
        
        try {
            let infoResponse = await fetch(`${folder}/info.json`);
            let info = await infoResponse.json();
            if (info.cover) {
                coverImage = `${folder}/${info.cover}`;
            }
        } catch (e) {
            console.log("No info.json found, using default cover");
        }

        // Rest of your existing code for displaying songs...
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

const playMusic = (track, pause = false) => {

    // Remove playing class from all li elements
    document.querySelectorAll('.songList ul li').forEach(li => {
        li.classList.remove('playing');
    });

    currentSong.src = `${currFolder}/` + track
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
        // Replace with your actual album folders
        const albums = [
            {
                folder: "0",
                title: "NCS Releases",
                description: "No Copyright Sounds",
                cover: "cover.jpeg"
            },
            {
                folder: "1",
                title: "NCS Releases",
                description: "No Copyright Sounds",
                cover: "cover.jpeg"
            },
            {
                folder: "2",
                title: "NCS Releases",
                description: "No Copyright Sounds",
                cover: "cover.jpeg"
            },
            {
                folder: "3",
                title: "NCS Releases",
                description: "No Copyright Sounds",
                cover: "cover.jpeg"
            },
            {
                folder: "4",
                title: "NCS Releases",
                description: "No Copyright Sounds",
                cover: "cover.jpeg"
            },
            {
                folder: "5",
                title: "NCS Releases",
                description: "No Copyright Sounds",
                cover: "cover.jpeg"
            },
            {
                folder: "6",
                title: "NCS Releases",
                description: "No Copyright Sounds",
                cover: "cover.jpeg"
            },
            {
                folder: "7",
                title: "NCS Releases",
                description: "No Copyright Sounds",
                cover: "cover.jpeg"
            },
            {
                folder: "8",
                title: "NCS Releases",
                description: "No Copyright Sounds",
                cover: "cover.jpeg"
            },
            {
                folder: "9",
                title: "NCS Releases",
                description: "No Copyright Sounds",
                cover: "cover.jpeg"
            },
            {
                folder: "ncs",
                title: "NCS Releases",
                description: "No Copyright Sounds",
                cover: "cover.jpeg"
            }
            // Add more albums as needed
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

        // Rest of your event listener code...
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