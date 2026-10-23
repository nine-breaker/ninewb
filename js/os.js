(() => {
  const screen = document.getElementById('term-screen');
  const output = document.getElementById('term-output');
  const input  = document.getElementById('term-input');
  if (!screen || !output || !input) return;

  const IDLE_PLACEHOLDER = input.placeholder || 'SPEAK TO ME';
  const HINT = "type 'help' for a list of commands";
  const MAX_LINES = 200; // scrollback limit
  const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g; // [label](url) in command output becomes a link

  // commands: desc shows in help, run returns the lines to print (or null for none)
  const commands = {
    help: {
      desc: 'list commands',
      run: () => Object.entries(commands).map(([name, c]) => `${name.padEnd(8)} ${c.desc}`)
    },
    who_r_u: {
      desc: '?',
      run: () => ['wouldntu like 2 know?']
    },
    vid: {
      desc: 'video of tonight',
      run: () => ['[technology is gay](https://www.youtube.com/watch?v=ohfVOpBbXs0)']
    },
    clear: {
      desc: 'clear the screen',
      run: () => { output.replaceChildren(); return null; }
    }

    /*    date: {
      desc: 'print the date',
      run: () => [new Date().toLocaleString()]
    },
    */
  };

  // page-only commands: define window.TERM_COMMANDS before this script loads
  Object.assign(commands, window.TERM_COMMANDS || {});

  // previous commands (arrow up / down)
  const history = [];
  let historyIndex = 0;

  // only http(s), mailto and same-site urls are allowed (blocks javascript: urls)
  function isSafeUrl(url) {
    try {
      const { protocol } = new URL(url, location.href);
      return ['http:', 'https:', 'mailto:', location.protocol].includes(protocol);
    } catch {
      return false;
    }
  }

  // [label](url) 
  function buildLine(text, links) {
    const line = document.createElement('div');
    line.className = 'term-line';

    let last = 0;
    if (links) {
      for (const match of text.matchAll(LINK_RE)) {
        const [whole, label, url] = match;
        if (!isSafeUrl(url)) continue;

        const a = document.createElement('a');
        a.href = url;
        a.textContent = label;
        if (/^https?:$/.test(a.protocol) && a.origin !== location.origin) {
          a.target = '_blank'; // other sites open in a new tab
          a.rel = 'noopener';
        }

        line.append(text.slice(last, match.index), a);
        last = match.index + whole.length;
      }
    }
    line.append(text.slice(last)); // append(string) makes a text node, never html
    return line;
  }

  // add lines to the screen and scroll to the newest
  function print(lines, links = false) {
    lines.forEach((text) => output.appendChild(buildLine(text, links)));
    while (output.children.length > MAX_LINES) output.firstChild.remove();
    output.scrollTop = output.scrollHeight;
  }

  // run a typed command
  function run(raw) {
    const [name, ...args] = raw.toLowerCase().split(/\s+/);
    const cmd = Object.hasOwn(commands, name) ? commands[name] : null;

    print([`[nine:~]$ ${raw}`]);

    const lines = cmd ? cmd.run(args) : [`command not found: ${name}`, HINT];
    if (lines !== null) print(lines, true);
  }

  // placeholder switches to "help" on focus, hint prints once
  input.addEventListener('focus', () => {
    input.placeholder = 'help';
    if (!output.children.length) print([HINT]);
  });

  input.addEventListener('blur', () => {
    input.placeholder = IDLE_PLACEHOLDER;
  });

  // enter runs the command, arrows walk the history
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const raw = input.value.trim();
      input.value = '';
      if (!raw) return;
      history.push(raw);
      historyIndex = history.length;
      run(raw);
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
    } else if (e.key === 'ArrowDown' && history.length) {
      e.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] ?? '';
    }
  });

  // click the screen to focus the input (unless selecting text)
  screen.addEventListener('click', () => {
    if (!window.getSelection().toString()) input.focus();
  });
})();