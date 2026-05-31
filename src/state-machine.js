export const STATES = {
  WALK_RIGHT:    'walk-right',
  WALK_LEFT:     'walk-left',
  IDLE:          'idle',
  SITTING:       'sitting',
  FOLLOW_CURSOR: 'follow-cursor',
  CLICKED:       'clicked',
};

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export class StateMachine {
  constructor() {
    this.state = STATES.WALK_RIGHT;
    this._preInterruptState = STATES.WALK_RIGHT;
    this._timer = null;
    this._onTransition = null;
  }

  setOnTransition(cb) {
    this._onTransition = cb;
  }

  _transition(newState) {
    this.state = newState;
    if (this._onTransition) this._onTransition(newState);
  }

  start() {
    this._scheduleNext();
  }

  stop() {
    if (this._timer) clearTimeout(this._timer);
    this._timer = null;
  }

  _scheduleNext() {
    const delays = {
      [STATES.WALK_RIGHT]: randomBetween(3000, 8000),
      [STATES.WALK_LEFT]:  randomBetween(3000, 8000),
      [STATES.IDLE]:       randomBetween(2000, 4000),
      [STATES.SITTING]:    randomBetween(2000, 5000),
    };
    const delay = delays[this.state] ?? 3000;
    this._timer = setTimeout(() => this._autonomousTransition(), delay);
  }

  _autonomousTransition() {
    const next = {
      [STATES.WALK_RIGHT]: STATES.IDLE,
      [STATES.WALK_LEFT]:  STATES.IDLE,
      [STATES.IDLE]:       STATES.SITTING,
      [STATES.SITTING]:    Math.random() > 0.5 ? STATES.WALK_RIGHT : STATES.WALK_LEFT,
    }[this.state] || STATES.WALK_RIGHT;

    this._preInterruptState = next;
    this._transition(next);
    this._scheduleNext();
  }

  onEdge(edge) {
    if (edge === 'right' && this.state === STATES.WALK_RIGHT) {
      this._preInterruptState = STATES.WALK_LEFT;
      this._transition(STATES.WALK_LEFT);
    } else if (edge === 'left' && this.state === STATES.WALK_LEFT) {
      this._preInterruptState = STATES.WALK_RIGHT;
      this._transition(STATES.WALK_RIGHT);
    }
  }

  onCursorNear() {
    if (this.state === STATES.CLICKED) return;
    if (this.state !== STATES.FOLLOW_CURSOR) {
      this._transition(STATES.FOLLOW_CURSOR);
    }
  }

  onCursorFar() {
    if (this.state === STATES.FOLLOW_CURSOR) {
      this.stop();
      this._transition(this._preInterruptState);
      this._scheduleNext();
    }
  }

  onClick() {
    if (this.state === STATES.CLICKED) return;
    this._transition(STATES.CLICKED);
  }

  onClickEnd() {
    this.stop();
    this._transition(this._preInterruptState);
    this._scheduleNext();
  }
}
