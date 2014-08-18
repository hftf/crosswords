// Generated by CoffeeScript 1.7.1
(function() {
  $(function() {
    var STROKE_WIDTH_OTHER, STROKE_WIDTH_PLAYER, USER, across_highlight, add_chat_message, alphanum, background, black_squares, blacken_square, ci, cj, clues, cursors, dir, dir_arrows, down_highlight, fill_existing_colors, fill_existing_letters, flip_dir, get_clue_number, go_down, go_left, go_right, go_to_clue, go_up, greenBG, grid_lines, grid_size, grid_size_max, has_number, letter, letters, lsns, make_puzzle, new_letter, next_number, next_square, number_list, number_text, numbers, numbers_rev, on_board, other_dir, p, pad_zero, paper, place_cursor, player_squares, prev_number, puzzle_size, rehighlight, reset_puzzle, room, scolor, send_chat_message, send_set_cursor, send_set_square_value, set_cursor, set_player_square, set_square_value, sid, socket, square_highlight, square_size, tick_timer, time_ping, timer, timer_string, update_current_clue, uuid, valid, _i, _len, _name;
    time_ping = void 0;
    window.time_delta = 0;
    window.client_start_time = void 0;
    window.fake_start = +new Date(2010, 0, 1, 0, 0, 0);
    timer = void 0;
    socket = window.io.connect(location.origin.replace(/^http/, 'ws'));
    console.log('connecting to socket.io');
    lsns = 'mcamac:';
    uuid = localStorage[_name = lsns + 'uuid'] || (localStorage[_name] = null);
    room = 'foo';
    sid = '';
    scolor = '';
    socket.emit('initialize', {
      uuid: uuid,
      room: room
    });
    socket.on('self metadata', function(data) {
      sid = data.id;
      return scolor = data.color;
    });
    socket.on('client chat message', function(data) {
      console.log('client chat message', data);
      return add_chat_message("<b>" + data.name + "</b>: " + data.message);
    });
    socket.on('existing puzzle', function(data) {
      make_puzzle(data.puzzle);
      fill_existing_letters(data.grid);
      fill_existing_colors(data.player_squares);
      window.start = client_start_time;
      if (data.complete) {
        return greenBG();
      }
    });
    socket.on('room members', function(data) {
      var id, ids, _, _results;
      console.log(data);
      $('#members_box').html($.map(data, function(row) {
        return "<span class='member' style='border-color: " + row.color + ";'>" + row.name + "</span>";
      }).join(', '));
      send_set_cursor(ci, cj);
      ids = $.map(data, function(row) {
        return row.id;
      });
      console.log(ids);
      _results = [];
      for (id in cursors) {
        _ = cursors[id];
        if ($.inArray(id, ids) === -1 && cursors[id]) {
          cursors[id].remove();
          _results.push(cursors[id] = void 0);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    });
    socket.on('change square', function(data) {
      var char, i, j;
      i = data.i;
      j = data.j;
      char = data.char;
      set_square_value(i, j, char, false);
      if (char !== '') {
        return set_player_square(i, j, data.color);
      } else {
        if (player_squares[i][j]) {
          return player_squares[i][j].remove();
        }
      }
    });
    socket.on('set cursor', function(data) {
      return place_cursor(data.user.id, data.user.color, data.content[0], data.content[1]);
    });
    socket.on('want cursors', function(data) {
      send_set_cursor(ci, cj);
      if (background) {
        return background.toFront();
      }
    });
    send_chat_message = function(message) {
      console.log('sending', message);
      return socket.emit('chat message', message);
    };
    add_chat_message = function(message) {
      $('#chat_box').append("<p>" + message + "</p>");
      return $('#chat_box').scrollTop($('#chat_box')[0].scrollHeight);
    };
    greenBG = function() {
      return background.node.classList.add('green');
    };
    grid_lines = [];
    grid_size_max = 540;
    grid_size = grid_size_max;
    number_text = {};
    numbers = {};
    number_list = [];
    numbers_rev = {};
    puzzle_size = 15;
    background = null;
    p = {};
    square_size = grid_size / puzzle_size;
    letters = {};
    ci = 0;
    cj = 0;
    clues = {
      A: {},
      D: {}
    };
    square_highlight = null;
    across_highlight = null;
    down_highlight = null;
    STROKE_WIDTH_PLAYER = 5;
    STROKE_WIDTH_OTHER = 3;
    cursors = {};
    black_squares = {};
    player_squares = {};
    paper = Raphael("crossword_canvas", grid_size + 2, grid_size + 2);
    USER = 0;
    dir = 'A';
    dir_arrows = {
      A: '▶',
      D: '▼'
    };
    blacken_square = function(i, j) {
      if (black_squares[i][j]) {
        black_squares[i][j].remove();
      }
      black_squares[i][j] = paper.rect(j * square_size + 0.5, i * square_size + 0.5, square_size, square_size);
      return black_squares[i][j].node.classList.add('black');
    };
    set_player_square = function(i, j, color) {
      var H, W, X, Y, xoffset;
      if (player_squares[i][j]) {
        player_squares[i][j].remove();
      }
      xoffset = puzzle_size >= 20 ? 0.33 : 0.2;
      X = 1 + ~~(j * square_size + square_size * xoffset);
      Y = 1 + ~~(i * square_size + 7 * square_size / 8);
      W = ~~(square_size * 0.6);
      H = ~~(square_size / 8);
      X = 1 + ~~(j * square_size);
      Y = 1 + ~~(i * square_size);
      W = -1 + square_size;
      H = -1 + square_size;
      player_squares[i][j] = paper.rect(X, Y, W, H).attr({
        fill: color
      });
      player_squares[i][j].node.classList.add('player-square');
      return player_squares[i][j].toBack();
    };
    has_number = function(p, i, j) {
      if (p[i][j] === '_') {
        return false;
      }
      if (i === 0 || j === 0) {
        return true;
      }
      if (p[i - 1][j] === '_' || p[i][j - 1] === '_') {
        return true;
      }
      return false;
    };
    new_letter = function(i, j, char) {
      var xoffset;
      xoffset = puzzle_size >= 20 ? 0.63 : 0.5;
      return paper.text((j + xoffset) * square_size, Math.round((i + 0.55) * square_size), char).attr({
        'font-size': puzzle_size >= 20 ? 16 : 20,
        'text-anchor': 'middle',
        'font-family': 'Source Sans',
        'font-weight': '600'
      });
    };
    fill_existing_letters = function(grid) {
      var i, j, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = puzzle_size - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push((function() {
          var _j, _ref1, _results1;
          _results1 = [];
          for (j = _j = 0, _ref1 = puzzle_size - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
            if (letters[i][j]) {
              letters[i][j].remove();
            }
            _results1.push(letters[i][j] = new_letter(i, j, grid[i][j]));
          }
          return _results1;
        })());
      }
      return _results;
    };
    fill_existing_colors = function(grid_colors) {
      var i, j, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = puzzle_size - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push((function() {
          var _j, _ref1, _results1;
          _results1 = [];
          for (j = _j = 0, _ref1 = puzzle_size - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
            if (player_squares[i][j]) {
              player_squares[i][j].remove();
            }
            _results1.push(set_player_square(i, j, grid_colors[i][j]));
          }
          return _results1;
        })());
      }
      return _results;
    };
    set_square_value = function(i, j, char, broadcast) {
      var xoffset;
      if (letters[i][j]) {
        letters[i][j].remove();
      }
      char = char.toUpperCase();
      xoffset = puzzle_size >= 20 ? 0.63 : 0.5;
      letters[i][j] = paper.text((j + xoffset) * square_size, Math.round((i + 0.55) * square_size), char).attr({
        'font-size': puzzle_size >= 20 ? 16 : 20,
        'text-anchor': 'middle',
        'font-family': 'Source Sans',
        'font-weight': '600'
      });
      if (background) {
        return background.toFront();
      }
    };
    send_set_square_value = function(i, j, char) {
      return socket.emit('change square', {
        i: i,
        j: j,
        char: char
      });
    };
    valid = function(p, i, j) {
      if (i < 0 || j < 0 || i >= puzzle_size || j >= puzzle_size || p[i][j] === '_') {
        return false;
      }
      return true;
    };
    on_board = function(i, j) {
      return i >= 0 && j >= 0 && i < puzzle_size && j < puzzle_size;
    };
    get_clue_number = function(p, i, j, d) {
      if (!valid(p, i, j)) {
        return -1;
      }
      if (d === 'A') {
        while (valid(p, i, j - 1)) {
          j--;
        }
      }
      if (d === 'D') {
        while (valid(p, i - 1, j)) {
          i--;
        }
      }
      return numbers[i][j];
    };
    next_number = function(n) {
      var i, _i, _len;
      for (_i = 0, _len = number_list.length; _i < _len; _i++) {
        i = number_list[_i];
        if (i >= n + 1 && $(".li-clue[data-clue-id=" + dir + i + "]").length > 0) {
          return i;
        }
      }
      return 1;
    };
    prev_number = function(n) {
      var i, x, _i, _ref;
      for (i = _i = _ref = number_list.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
        x = number_list[i];
        if (x <= n - 1 && $(".li-clue[data-clue-id=" + dir + x + "]").length > 0) {
          return x;
        }
      }
      return number_list[number_list.length - 1];
    };
    go_to_clue = function(clue_id) {
      var ns;
      ns = numbers_rev["" + (dir + clue_id)];
      return set_cursor(ns[0], ns[1]);
    };
    other_dir = function(d) {
      if (d === 'D') {
        return 'A';
      } else {
        return 'D';
      }
    };
    flip_dir = function() {
      dir = other_dir(dir);
      rehighlight();
      return update_current_clue();
    };
    next_square = function(i, j, oi, oj) {
      var tryi, tryj;
      tryi = i + oi;
      tryj = j + oj;
      while (!valid(p, tryi, tryj) && on_board(tryi, tryj)) {
        tryi += oi;
        tryj += oj;
      }
      if (on_board(tryi, tryj)) {
        return [tryi, tryj];
      }
      return [i, j];
    };
    alphanum = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (_i = 0, _len = alphanum.length; _i < _len; _i++) {
      letter = alphanum[_i];
      key(letter, function(e) {
        var chr;
        chr = String.fromCharCode(e.keyCode);
        set_square_value(ci, cj, chr);
        send_set_square_value(ci, cj, chr);
        if (dir === 'A' && valid(p, ci, cj + 1)) {
          return go_right();
        } else if (dir === 'D' && valid(p, ci + 1, cj)) {
          return go_down();
        }
      });
    }
    go_left = function() {
      var ns;
      ns = next_square(ci, cj, 0, -1);
      return set_cursor(ns[0], ns[1]);
    };
    go_right = function() {
      var ns;
      ns = next_square(ci, cj, 0, 1);
      return set_cursor(ns[0], ns[1]);
    };
    go_up = function() {
      var ns;
      ns = next_square(ci, cj, -1, 0);
      return set_cursor(ns[0], ns[1]);
    };
    go_down = function() {
      var ns;
      ns = next_square(ci, cj, 1, 0);
      return set_cursor(ns[0], ns[1]);
    };
    key('left', go_left);
    key('up', function(e) {
      e.preventDefault();
      return go_up();
    });
    key('right', go_right);
    key('down', function(e) {
      e.preventDefault();
      return go_down();
    });
    key('space', function(e) {
      e.preventDefault();
      return flip_dir();
    });
    key('backspace', function(e) {
      e.preventDefault();
      send_set_square_value(ci, cj, '');
      if (dir === 'A') {
        return go_left();
      } else {
        return go_up();
      }
    });
    key('tab', function(e) {
      e.preventDefault();
      return go_to_clue(next_number(get_clue_number(p, ci, cj, dir)));
    });
    key('shift+tab', function(e) {
      e.preventDefault();
      return go_to_clue(prev_number(get_clue_number(p, ci, cj, dir)));
    });
    rehighlight = function() {
      var acr_ej, acr_sj, down_ei, down_si;
      acr_sj = cj;
      acr_ej = cj;
      while (valid(p, ci, acr_sj - 1)) {
        acr_sj--;
      }
      while (valid(p, ci, acr_ej + 1)) {
        acr_ej++;
      }
      across_highlight.attr({
        width: ~~(square_size * (acr_ej - acr_sj + 1)) - STROKE_WIDTH_PLAYER - 1,
        x: acr_sj * square_size + 0.5 + (STROKE_WIDTH_PLAYER + 1) / 2,
        y: ci * square_size + 0.5 + (STROKE_WIDTH_PLAYER + 1) / 2
      });
      across_highlight.node.classList[dir === 'A' ? 'add' : 'remove']('highlight-parallel');
      across_highlight.node.classList[dir === 'A' ? 'remove' : 'add']('highlight-perpendicular');
      down_si = ci;
      down_ei = ci;
      while (valid(p, down_si - 1, cj)) {
        down_si--;
      }
      while (valid(p, down_ei + 1, cj)) {
        down_ei++;
      }
      down_highlight.attr({
        height: ~~(square_size * (down_ei - down_si + 1)) - STROKE_WIDTH_PLAYER - 1,
        x: cj * square_size + 0.5 + (STROKE_WIDTH_PLAYER + 1) / 2,
        y: down_si * square_size + 0.5 + (STROKE_WIDTH_PLAYER + 1) / 2
      });
      down_highlight.node.classList[dir === 'D' ? 'add' : 'remove']('highlight-parallel');
      down_highlight.node.classList[dir === 'D' ? 'remove' : 'add']('highlight-perpendicular');
      square_highlight.attr({
        x: cj * square_size + 0.5 + (STROKE_WIDTH_PLAYER + 1) / 2,
        y: ci * square_size + 0.5 + (STROKE_WIDTH_PLAYER + 1) / 2
      });
    };
    set_cursor = function(i, j) {
      if (p[i][j] === '_') {
        return;
      }
      if (letters[ci][cj] && !(ci === i && cj === j)) {
        letters[ci][cj].attr('fill', 'black');
      }
      if (number_text[ci][cj]) {
        number_text[ci][cj].attr('fill', 'black');
      }
      ci = i;
      cj = j;
      rehighlight();
      update_current_clue();
      place_cursor(sid, scolor, i, j);
      return send_set_cursor(ci, cj);
    };
    send_set_cursor = function(i, j) {
      return socket.emit('set cursor', {
        content: [i, j]
      });
    };
    place_cursor = function(pid, color, i, j) {
      if (!cursors[pid]) {
        cursors[pid] = paper.rect(-50, -50, square_size - STROKE_WIDTH_OTHER - 1, square_size - STROKE_WIDTH_OTHER - 1).attr({
          stroke: color,
          'stroke-width': STROKE_WIDTH_OTHER
        });
        return cursors[pid].node.classList.add('their-highlight-square');
      } else {
        return cursors[pid].attr({
          stroke: color,
          x: j * square_size + 0.5 + (STROKE_WIDTH_OTHER + 1) / 2,
          y: i * square_size + 0.5 + (STROKE_WIDTH_OTHER + 1) / 2
        });
      }
    };
    update_current_clue = function() {
      var clue, number, other_number;
      number = get_clue_number(p, ci, cj, dir);
      other_number = get_clue_number(p, ci, cj, other_dir(dir));
      $('.li-clue').removeClass('active');
      $('.li-clue').removeClass('semi-active');
      $(".li-clue[data-clue-id=" + dir + number + "]").addClass('active');
      $(".li-clue[data-clue-id=" + (other_dir(dir)) + other_number + "]").addClass('semi-active');
      $("#" + dir + "_clues").scrollTo(".li-clue[data-clue-id=" + dir + number + "]", 75);
      $("#" + (other_dir(dir)) + "_clues").scrollTo(".li-clue[data-clue-id=" + (other_dir(dir)) + other_number + "]", 75);
      clue = clues[dir][number];
      return $('#current_clue').html("<strong class='current-clue-number'> " + dir_arrows[dir] + (" " + number + "</strong> " + clue));
    };
    make_puzzle = function(contents) {
      var clue, current_number, fj, i, j, line, num, offset, puzzle, pxoff, _j, _k, _l, _len1, _m, _n, _o, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      puzzle = contents;
      p = puzzle.puzzle;
      $('#puzzle_title').html(puzzle.title);
      puzzle_size = +puzzle.height;
      square_size = ~~(grid_size_max / puzzle_size);
      grid_size = square_size * puzzle_size;
      clues['A'] = puzzle.clues.across;
      clues['D'] = puzzle.clues.down;
      reset_puzzle();
      _ref = contents.clues.across;
      for (num in _ref) {
        clue = _ref[num];
        $('#A_clues').append("<li class='li-clue' data-clue-id=A" + num + "><div class=\"num\"> " + num + " </div> <div class=\"clue-text\"> " + clue + " </div></li>");
      }
      _ref1 = contents.clues.down;
      for (num in _ref1) {
        clue = _ref1[num];
        $('#D_clues').append("<li class='li-clue' data-clue-id=D" + num + "><div class=\"num\"> " + num + " </div> <div class=\"clue-text\"> " + clue + " </div></li>");
      }
      $('.li-clue').on('click', function(e) {
        var clue_id, ns;
        clue_id = $(this).data('clue-id');
        ns = numbers_rev[clue_id];
        if (clue_id[0] !== dir) {
          flip_dir();
        }
        return set_cursor(ns[0], ns[1]);
      });
      for (i = _j = 0, _ref2 = puzzle_size - 1; 0 <= _ref2 ? _j <= _ref2 : _j >= _ref2; i = 0 <= _ref2 ? ++_j : --_j) {
        for (j = _k = 0, _ref3 = puzzle_size - 1; 0 <= _ref3 ? _k <= _ref3 : _k >= _ref3; j = 0 <= _ref3 ? ++_k : --_k) {
          if (puzzle.puzzle[i][j] === '_') {
            blacken_square(i, j);
          }
        }
      }
      for (offset = _l = 0; 0 <= puzzle_size ? _l <= puzzle_size : _l >= puzzle_size; offset = 0 <= puzzle_size ? ++_l : --_l) {
        pxoff = square_size * offset + 0.5;
        grid_lines.push(paper.path("M" + pxoff + ",0.5v" + grid_size));
        grid_lines.push(paper.path("M0.5," + pxoff + "h" + grid_size));
      }
      for (_m = 0, _len1 = grid_lines.length; _m < _len1; _m++) {
        line = grid_lines[_m];
        line.node.classList.add('gridline');
      }
      current_number = 1;
      for (i = _n = 0, _ref4 = puzzle_size - 1; 0 <= _ref4 ? _n <= _ref4 : _n >= _ref4; i = 0 <= _ref4 ? ++_n : --_n) {
        for (j = _o = 0, _ref5 = puzzle_size - 1; 0 <= _ref5 ? _o <= _ref5 : _o >= _ref5; j = 0 <= _ref5 ? ++_o : --_o) {
          if (has_number(p, i, j)) {
            number_text[i][j] = paper.text(square_size * j + 2, square_size * i + 8, current_number).attr({
              'font-size': puzzle_size >= 20 ? '9px' : '11px',
              'text-anchor': 'start'
            });
            number_text[i][j].node.className.baseVal += ' grid-number';
            numbers[i][j] = current_number;
            number_list.push(current_number);
            numbers_rev['A' + current_number] = [i, j];
            numbers_rev['D' + current_number] = [i, j];
            current_number += 1;
          }
        }
      }
      if (background) {
        background.remove();
      }
      background = paper.rect(0, 0, grid_size, grid_size);
      background.node.classList.add('background');
      background.click(function(e) {
        var ei, ej;
        ei = Math.floor(e.layerY / square_size);
        ej = Math.floor(e.layerX / square_size);
        if (ei === ci && ej === cj) {
          flip_dir();
        }
        return set_cursor(ei, ej);
      });
      fj = 0;
      while (p[0][fj] === '_') {
        fj++;
      }
      set_cursor(0, fj);
      socket.emit('want cursors');
      return timer = setInterval(tick_timer, tick_timer.delay);
    };
    $('#chat_input').on('keyup', function(e) {
      if (e.keyCode === 13) {
        send_chat_message($(this).val());
        return $(this).val('');
      }
    });
    reset_puzzle = function() {
      var i, j, line, _, _j, _k, _l, _len1, _ref, _ref1, _ref2;
      for (_j = 0, _len1 = grid_lines.length; _j < _len1; _j++) {
        line = grid_lines[_j];
        line.remove();
      }
      for (i in letters) {
        _ = letters[i];
        _ref = letters[i];
        for (j in _ref) {
          _ = _ref[j];
          if (black_squares[i] && black_squares[i][j]) {
            black_squares[i][j].remove();
          }
          if (letters[i] && letters[i][j]) {
            set_square_value(i, j, '', false);
          }
          if (number_text[i] && number_text[i][j]) {
            number_text[i][j].remove();
          }
          if (player_squares[i] && player_squares[i][j]) {
            player_squares[i][j].remove();
          }
        }
      }
      for (i = _k = 0, _ref1 = puzzle_size - 1; 0 <= _ref1 ? _k <= _ref1 : _k >= _ref1; i = 0 <= _ref1 ? ++_k : --_k) {
        black_squares[i] = {};
        letters[i] = {};
        numbers[i] = {};
        number_text[i] = {};
        player_squares[i] = {};
        for (j = _l = 0, _ref2 = puzzle_size - 1; 0 <= _ref2 ? _l <= _ref2 : _l >= _ref2; j = 0 <= _ref2 ? ++_l : --_l) {
          black_squares[i][j] = null;
          letters[i][j] = null;
          numbers[i][j] = null;
          number_text[i][j] = null;
          player_squares[i][j] = null;
        }
      }
      numbers_rev = {};
      if (across_highlight) {
        across_highlight.remove();
      }
      across_highlight = paper.rect(-50, -50, square_size, square_size - STROKE_WIDTH_PLAYER - 1).attr({
        'stroke-width': STROKE_WIDTH_PLAYER
      });
      across_highlight.node.classList.add('highlight-across', 'highlight-parallel');
      if (down_highlight) {
        down_highlight.remove();
      }
      down_highlight = paper.rect(-50, -50, square_size - STROKE_WIDTH_PLAYER - 1, square_size).attr({
        'stroke-width': STROKE_WIDTH_PLAYER
      });
      down_highlight.node.classList.add('highlight-down', 'highlight-perpendicular');
      if (square_highlight) {
        square_highlight.remove();
      }
      square_highlight = paper.rect(-50, -50, square_size - STROKE_WIDTH_PLAYER - 1, square_size - STROKE_WIDTH_PLAYER - 1).attr({
        'stroke-width': STROKE_WIDTH_PLAYER
      });
      square_highlight.node.classList.add('highlight-square');
      $('#A_clues').empty();
      return $('#D_clues').empty();
    };
    $('#fileupload').fileupload({
      dataType: 'json',
      add: function(e, data) {
        return data.submit();
      },
      done: function(e, data) {}
    });
    $('#upload_button').click(function(e) {
      return e.preventDefault();
    });
    pad_zero = function(n) {
      if (n < 10) {
        return "0" + n;
      } else {
        return n;
      }
    };
    timer_string = function(deci) {
      return window.timer_string_(+(new Date), deci);
    };
    window.timer_string_ = function(current_time, deci) {
      var deciseconds, hours, minutes, seconds, string, total_seconds;
      total_seconds = (current_time - window.client_start_time) / 1e3;
      if (total_seconds < 0) {
        console.error("" + total_seconds + " is negative");
        total_seconds = 0;
      }
      hours = ~~(total_seconds / 3600);
      minutes = ~~(total_seconds / 60) % 60;
      seconds = ~~total_seconds % 60;
      string = hours > 0 ? "" + hours + ":" + (pad_zero(minutes)) + ":" : "" + minutes + ":";
      string += pad_zero(~~seconds);
      if (deci) {
        deciseconds = ~~(10 * total_seconds % 10);
        string += "<small class='deciseconds'>." + deciseconds + "</small>";
      }
      return string;
    };
    tick_timer = function() {
      return $('#timer').html(timer_string(true));
    };
    return tick_timer.delay = 100;
  });

}).call(this);
