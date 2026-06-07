//音频播放时间换算
function transTime(value) {
  var time = '';
  var h = parseInt(value / 3600);
  value %= 3600;
  var m = parseInt(value / 60);
  var s = parseInt(value % 60);
  if (h > 0) {
    time = formatTime(h + ':' + m + ':' + s);
  } else {
    time = formatTime(m + ':' + s);
  }

  return time;
}

// 格式化时间显示，补零对齐
function formatTime(value) {
  var time = '';
  var s = value.split(':');
  var i = 0;
  for (; i < s.length - 1; i++) {
    time += s[i].length == 1 ? '0' + s[i] : s[i];
    time += ':';
  }
  time += s[i].length == 1 ? '0' + s[i] : s[i];

  return time;
}

// 音乐播放器主程序
document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const audio = document.getElementById('audioTag');
  const playPauseBtn = document.getElementById('playPause');
  const skipForwardBtn = document.getElementById('skipForward');
  const skipBackwardBtn = document.getElementById('skipBackward');
  const progressTotal = document.getElementById('progress-total');
  const progress = document.getElementById('progress');
  const playedTime = document.getElementById('playedTime');
  const audioTime = document.getElementById('audioTime');
  const volumeBtn = document.getElementById('volume');
  const volumeSlider = document.getElementById('volumn-togger');
  const volumeFill = document.getElementById('volume-fill');
  const playModeBtn = document.getElementById('playMode');
  const listBtn = document.getElementById('list');
  const musicList = document.getElementById('music-list');
  const closeListBtn = document.getElementById('close-list');
  const speedBtn = document.getElementById('speed');
  const recordImg = document.getElementById('record-img');
  const musicTitle = document.getElementById('music-title');
  const authorName = document.getElementById('author-name');
  const body = document.getElementById('body');

  // 音乐数据
  const musicData = [
    {
      title: 'Friendships (Original Mix)',
      author: 'Tülpa/gnash/BLANKTS',
      src: './songs/music0.mp3',
      bg: './img/bg0.png',
      record: './img/record0.jpg'
    },
    {
      title: 'Kiss Fight (Ben Phipps Remix)',
      author: 'Pascal Letoublon',
      src: './songs/music1.mp3',
      bg: './img/bg1.png',
      record: './img/record1.jpg'
    },
    {
      title: 'Coming Home',
      author: 'Dash Berlin/Bo Bruce',
      src: './songs/music2.mp3',
      bg: './img/bg2.png',
      record: './img/record2.jpg'
    },
    {
      title: 'Coming Home（高质）',
      author: 'Dash Berlin/Bo Bruce',
      src: './songs/music3.mp3',
      bg: './img/bg3.png',
      record: './img/record3.jpg'
    }
  ];

  // 播放器状态
  let currentIndex = 0;
  let isPlaying = false;
  let playMode = 0; // 0: 顺序播放, 1: 单曲循环, 2: 随机播放（默认顺序播放）
  let previousIndex = 0; // 记录上一首索引，用于单曲循环
  let playSpeed = 1.0;
  let isMuted = false; // 是否静音

  // 初始化播放器
  function initPlayer() {
    loadMusic(currentIndex);
    audio.volume = volumeSlider.value / 100;
    updateVolumeFill();
    updatePlayModeIcon();
  }

  // 加载音乐
  function loadMusic(index) {
    const music = musicData[index];
    audio.src = music.src;
    musicTitle.textContent = music.title;
    authorName.textContent = music.author;
    body.background = music.bg;
    recordImg.style.backgroundImage = `url(${music.record})`;
    
    // 更新音乐列表高亮
    updateMusicListHighlight();
  }

  // 播放/暂停
  function togglePlay() {
    if (isPlaying) {
      audio.pause();
      playPauseBtn.style.backgroundImage = "url('./img/继续播放.png')";
      recordImg.classList.remove('rotate-play');
      recordImg.classList.add('rotate-pause');
    } else {
      audio.play();
      playPauseBtn.style.backgroundImage = "url('./img/暂停.png')";
      recordImg.classList.remove('rotate-pause');
      recordImg.classList.add('rotate-play');
    }
    isPlaying = !isPlaying;
  }

  // 上一首
  function playPrevious() {
    if (playMode === 2) {
      // 随机播放
      currentIndex = Math.floor(Math.random() * musicData.length);
    } else {
      currentIndex = (currentIndex - 1 + musicData.length) % musicData.length;
    }
    loadMusic(currentIndex);
    if (isPlaying) {
      audio.play();
    }
  }

  // 下一首
  function playNext() {
    if (playMode === 2) {
      // 随机播放：随机选择下一首，避免重复播放同一首
      let newIndex = Math.floor(Math.random() * musicData.length);
      while (newIndex === currentIndex && musicData.length > 1) {
        newIndex = Math.floor(Math.random() * musicData.length);
      }
      currentIndex = newIndex;
    } else {
      // 顺序播放和单曲循环：都播放下一首（单曲循环只在自动播放时生效）
      currentIndex = (currentIndex + 1) % musicData.length;
    }
    loadMusic(currentIndex);
    if (isPlaying) {
      audio.play();
    }
  }

  // 更新进度条
  function updateProgress() {
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = percent + '%';
    playedTime.textContent = transTime(audio.currentTime);
  }

  // 点击进度条跳转
  function seekTo(e) {
    const rect = progressTotal.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
  }

  // 更新音量填充条
  function updateVolumeFill() {
    volumeFill.style.width = volumeSlider.value + '%';
  }

  // 音量调节
  function adjustVolume() {
    audio.volume = volumeSlider.value / 100;
    updateVolumeFill();
    if (audio.volume === 0) {
      audio.muted = true;
      volumeBtn.style.backgroundImage = "url('./img/静音.png')";
      isMuted = true;
    } else {
      audio.muted = false;
      volumeBtn.style.backgroundImage = "url('./img/音量.png')";
      isMuted = false;
    }
  }

  // 点击喇叭静音/取消静音
  function toggleMute() {
    if (isMuted) {
      // 取消静音
      audio.muted = false;
      volumeSlider.value = 50; // 默认恢复到50%音量
      audio.volume = 0.5;
      updateVolumeFill();
      volumeBtn.style.backgroundImage = "url('./img/音量.png')";
      isMuted = false;
    } else {
      // 静音
      audio.muted = true;
      volumeSlider.value = 0; // 音量条变为最小
      audio.volume = 0;
      updateVolumeFill();
      volumeBtn.style.backgroundImage = "url('./img/静音.png')";
      isMuted = true;
    }
  }

  // 切换播放模式
  function switchPlayMode() {
    playMode = (playMode + 1) % 3;
    updatePlayModeIcon();
  }

  // 更新播放模式图标
  function updatePlayModeIcon() {
    const modeImages = ['./img/mode2.png', './img/mode1.png', './img/mode3.png']; // 顺序: 顺序播放, 单曲循环, 随机播放
    playModeBtn.style.backgroundImage = `url('${modeImages[playMode]}')`;
  }

  // 显示/隐藏音乐列表
  function toggleMusicList() {
    if (musicList.style.display === 'block') {
      musicList.style.display = 'none';
      closeListBtn.style.display = 'none';
    } else {
      musicList.style.display = 'block';
      closeListBtn.style.display = 'block';
    }
  }

  // 更新音乐列表高亮
  function updateMusicListHighlight() {
    for (let i = 0; i < musicData.length; i++) {
      const musicItem = document.getElementById('music' + i);
      if (i === currentIndex) {
        musicItem.style.color = '#ff6b6b';
        musicItem.style.fontWeight = 'bold';
      } else {
        musicItem.style.color = '#ffffff';
        musicItem.style.fontWeight = 'normal';
      }
    }
  }

  // 点击音乐列表播放
  function playFromList(index) {
    currentIndex = index;
    loadMusic(currentIndex);
    audio.play();
    isPlaying = true;
    playPauseBtn.style.backgroundImage = "url('./img/暂停.png')";
    recordImg.classList.remove('rotate-pause');
    recordImg.classList.add('rotate-play');
    musicList.style.display = 'none';
    closeListBtn.style.display = 'none';
  }

  // 切换倍速
  function switchSpeed() {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playSpeed);
    playSpeed = speeds[(currentIndex + 1) % speeds.length];
    audio.playbackRate = playSpeed;
    speedBtn.textContent = playSpeed.toFixed(1) + 'X';
  }

  // 事件监听
  playPauseBtn.addEventListener('click', togglePlay);
  skipForwardBtn.addEventListener('click', playPrevious);
  skipBackwardBtn.addEventListener('click', playNext);
  
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', function() {
    audioTime.textContent = transTime(audio.duration);
  });
  
  audio.addEventListener('ended', function() {
    if (playMode === 1) {
      // 单曲循环 (playMode === 1) - 直接重置到开头并播放
      音频.currentTime = 0;
      音频.play();
    } else {
      播放下一个();
    }
  });

  progressTotal.addEventListener('click', seekTo);
  volumeSlider.addEventListener('input', adjustVolume);
  volumeBtn.addEventListener('click', toggleMute); // 添加喇叭点击静音
  playModeBtn.addEventListener('click', switchPlayMode);
  listBtn.addEventListener('click', toggleMusicList);
  closeListBtn.addEventListener('click', toggleMusicList);
  speedBtn.addEventListener('click', switchSpeed);

  // 音乐列表点击事件
  对于 (让 i = 0; i < musicData.length; i++) {
    const musicItem = document.getElementById('music' + i);
    音乐项.添加事件监听器('点击', 函数() {
      从列表播放(i);
    });
    musicItem.style.cursor = 'pointer';
  }

  // 初始化
  initPlayer();
});
