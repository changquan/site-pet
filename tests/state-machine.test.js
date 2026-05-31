const { StateMachine, STATES } = require('../src/state-machine.js');

describe('StateMachine', () => {
  let sm;

  beforeEach(() => {
    jest.useFakeTimers();
    sm = new StateMachine();
  });

  afterEach(() => {
    sm.stop();
    jest.useRealTimers();
  });

  test('starts in walk-right state', () => {
    expect(sm.state).toBe(STATES.WALK_RIGHT);
  });

  test('onEdge right → flips to walk-left when walking right', () => {
    sm.state = STATES.WALK_RIGHT;
    sm.onEdge('right');
    expect(sm.state).toBe(STATES.WALK_LEFT);
  });

  test('onEdge left → flips to walk-right when walking left', () => {
    sm.state = STATES.WALK_LEFT;
    sm.onEdge('left');
    expect(sm.state).toBe(STATES.WALK_RIGHT);
  });

  test('onEdge right does nothing when walking left', () => {
    sm.state = STATES.WALK_LEFT;
    sm.onEdge('right');
    expect(sm.state).toBe(STATES.WALK_LEFT);
  });

  test('onEdge left does nothing when walking right', () => {
    sm.state = STATES.WALK_RIGHT;
    sm.onEdge('left');
    expect(sm.state).toBe(STATES.WALK_RIGHT);
  });

  test('onCursorNear → switches to follow-cursor', () => {
    sm.onCursorNear();
    expect(sm.state).toBe(STATES.FOLLOW_CURSOR);
  });

  test('onCursorNear does nothing when already in clicked', () => {
    sm.state = STATES.CLICKED;
    sm.onCursorNear();
    expect(sm.state).toBe(STATES.CLICKED);
  });

  test('onCursorFar → resumes pre-interrupt state', () => {
    sm._preInterruptState = STATES.WALK_LEFT;
    sm.onCursorNear();
    sm.onCursorFar();
    expect(sm.state).toBe(STATES.WALK_LEFT);
  });

  test('onCursorFar does nothing when not following cursor', () => {
    sm.state = STATES.IDLE;
    sm.onCursorFar();
    expect(sm.state).toBe(STATES.IDLE);
  });

  test('onClick → switches to clicked', () => {
    sm.onClick();
    expect(sm.state).toBe(STATES.CLICKED);
  });

  test('onClick does nothing when already clicked', () => {
    sm.onClick();
    sm.onClick();
    expect(sm.state).toBe(STATES.CLICKED);
  });

  test('onClickEnd → resumes pre-interrupt state', () => {
    sm._preInterruptState = STATES.IDLE;
    sm.onClick();
    sm.onClickEnd();
    expect(sm.state).toBe(STATES.IDLE);
  });

  test('setOnTransition callback fires on state change', () => {
    const cb = jest.fn();
    sm.setOnTransition(cb);
    sm.onClick();
    expect(cb).toHaveBeenCalledWith(STATES.CLICKED);
  });

  test('setOnTransition callback fires on edge bounce', () => {
    const cb = jest.fn();
    sm.setOnTransition(cb);
    sm.onEdge('right');
    expect(cb).toHaveBeenCalledWith(STATES.WALK_LEFT);
  });
});
