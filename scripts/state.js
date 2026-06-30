// ── 跨模块共享状态 ──
export const state = {
  // 播放器
  songs: [],
  currentSongIndex: 0,
  isShuffle: true,
  isRepeat: false,
  currentHowl: null,
  currentSongId: null,
  lyricsData: [],
  lyricsVisible: false,
  currentLyricIndex: -1,
  currentSongLrcUrl: null,
  lrcLoadId: 0,
};
