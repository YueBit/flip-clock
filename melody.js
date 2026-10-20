/* ---------------------------------------------------------------
   The music box's tune.

   One note is [beat, note, beats, velocity]. Beats count from the
   start of the piece; the low entries are the accompaniment
   arpeggio, the high ones the melody. The comb in the panel maps
   every note to a tooth by pitch, so this file also draws what you
   hear — a note added here gets a tooth and a pin of its own.

   The waltz below was written for this clock: an original piece in
   the idiom of a small music box, not a transcription of anything.
   If you would rather hear a particular tune, replace `notes` with
   your own — in the same shape, and only with music you have the
   right to use. A published song is somebody's copyright: its notes
   in this file would be a copy of the composition, which is a
   different thing from playing a record you own.
   --------------------------------------------------------------- */

var MUSIC_BOX_TUNE = {

  title: 'Waltz for a small room',
  tempo: 88,          // beats per minute, three to the bar

  notes: [
    /* bar 1 — Am */
    [0,  'A4', 1, 0.9], [0, 'A2', 1, 0.55], [1, 'C5', 1, 0.85], [1, 'E3', 1, 0.5], [2, 'E5', 1, 0.85], [2, 'A3', 1, 0.45],
    /* bar 2 — F */
    [3, 'F5', 1.5, 0.9], [3, 'F2', 1, 0.55], [4, 'C3', 1, 0.5], [4.5, 'E5', 0.5, 0.7], [5, 'C5', 1, 0.8], [5, 'F3', 1, 0.45],
    /* bar 3 — G */
    [6, 'D5', 1, 0.85], [6, 'G2', 1, 0.55], [7, 'C5', 1, 0.8], [7, 'D3', 1, 0.5], [8, 'B4', 1, 0.8], [8, 'B3', 1, 0.45],
    /* bar 4 — Am */
    [9, 'A4', 3, 0.85], [9, 'A2', 1, 0.55], [10, 'E3', 1, 0.5], [11, 'A3', 1, 0.45],
    /* bar 5 — C */
    [12, 'E5', 1, 0.85], [12, 'C3', 1, 0.55], [13, 'A5', 1, 0.95], [13, 'G3', 1, 0.5], [14, 'G5', 1, 0.85], [14, 'E4', 1, 0.45],
    /* bar 6 — F */
    [15, 'F5', 1.5, 0.9], [15, 'F2', 1, 0.55], [16, 'C3', 1, 0.5], [16.5, 'E5', 0.5, 0.7], [17, 'D5', 1, 0.8], [17, 'A3', 1, 0.45],
    /* bar 7 — Em */
    [18, 'E5', 1, 0.85], [18, 'E2', 1, 0.55], [19, 'D5', 1, 0.8], [19, 'B2', 1, 0.5], [20, 'B4', 1, 0.8], [20, 'G3', 1, 0.45],
    /* bar 8 — Am */
    [21, 'C5', 3, 0.85], [21, 'A2', 1, 0.55], [22, 'E3', 1, 0.5], [23, 'C4', 1, 0.45],
    /* bar 9 — C */
    [24, 'D5', 1, 0.85], [24, 'C3', 1, 0.55], [25, 'E5', 1, 0.85], [25, 'G3', 1, 0.5], [26, 'G5', 1, 0.9], [26, 'E4', 1, 0.45],
    /* bar 10 — F */
    [27, 'F5', 1.5, 0.9], [27, 'F2', 1, 0.55], [28, 'C3', 1, 0.5], [28.5, 'E5', 0.5, 0.7], [29, 'C5', 1, 0.8], [29, 'A3', 1, 0.45],
    /* bar 11 — G */
    [30, 'B4', 1, 0.8], [30, 'G2', 1, 0.55], [31, 'C5', 1, 0.8], [31, 'D3', 1, 0.5], [32, 'D5', 1, 0.85], [32, 'B3', 1, 0.45],
    /* bar 12 — Am */
    [33, 'A4', 3, 0.85], [33, 'A2', 1, 0.55], [34, 'E3', 1, 0.5], [35, 'A5', 1, 0.8], [35, 'A3', 1, 0.45]
  ]
};
