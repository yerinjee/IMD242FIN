// 원을 4개의 그룹으로 나눠 관리함.
let circles = {
  groupA: [],
  groupB: [],
  groupC: [],
  groupD: [],
};

// 각 원 그룹의 속성값을 설정해줌.
let _options = {
  a: [10, 2, 5, 50],
  b: [20, 5, 5, 50],
  c: [10, 5, 3, 50],
  d: [10, 10, 3, 25],
};

let _trailInteractive = 2; // 꼬리의 길이 조정 (마우스 Y좌표에 따라 달라짐)

// 종횡비를 고정하고 싶을 경우: 비율을 1:1로 설정함.
const aspectW = 1;
const aspectH = 1;

// html에서 클래스명이 container-canvas인 첫 엘리먼트: 컨테이너 가져오기.
const container = document.body.querySelector('.container-canvas');
// 필요에 따라 이하에 변수 생성.

const INITIAL_CIRCLE_COUNT = 20; // 각 그룹의 초기 원 개수를 설정함.
const LETTER_CIRCLE_MULTIPLIER = 1.5; // 텍스트 글자당 생성되는 원의 개수를 조절함.

let font;
let letters = [];

let saturationSlider; // 슬라이더 변수

function preload() {
  font = loadFont('built titling bd.otf'); // 폰트 로드해줌.
}

function setup() {
  // 컨테이너의 현재 위치, 크기 등의 정보 가져와서 객체구조분해할당을 통해 너비, 높이 정보를 변수로 추출.
  const { width: containerW, height: containerH } =
    container.getBoundingClientRect();

  // 컨테이너의 가로 비율이 설정한 종횡비의 가로 비율보다 작거나 같을 경우:
  // 컨테이너의 가로길이에 맞춰 종횡비대로 캔버스를 생성하고, 컨테이너의 자녀로 설정.
  if (aspectW === 0 || aspectH === 0) {
    createCanvas(containerW, containerH).parent(container);
  } else if (containerW / containerH > aspectW / aspectH) {
    createCanvas((containerH * aspectW) / aspectH, containerH).parent(
      container
    );
  } else {
    createCanvas(containerW, (containerW * aspectH) / aspectW).parent(
      container
    );
  }

  // 키를 누르지 않은 상태는 백그라운드만 남아서 초기에 'S'가 눌린 상태로 시작되도록 설정함.
  key = 'S';
  keyPressed(); // 'S'에 해당하는 텍스트 포인트 생성해줌.

  // 각 원 그룹에 초기 원 생성해줌.
  for (let i = 0; i < INITIAL_CIRCLE_COUNT; i++) {
    circles.groupA.push(
      new Circle(random(width * 0.25), random(height), _options.a)
    );
    circles.groupB.push(
      new Circle(random(width * 0.25 + width / 4), random(height), _options.b)
    );
    circles.groupC.push(
      new Circle(random(width * 0.5 + width / 2), random(height), _options.c)
    );
    circles.groupD.push(
      new Circle(random(width * 0.75 + width / 2), random(height), _options.d)
    );
  }

  // 슬라이더 생성 ( 원의 색상 채도를 조절하기 위해 생성함. )
  saturationSlider = createSlider(0, 100, 80);
  saturationSlider.position(width / 1.25, height / 7);
}

function createLetterPoints() {
  // 기존 원 데이터 초기화해줌.
  circles.groupA = [];
  circles.groupB = [];
  circles.groupC = [];
  circles.groupD = [];

  // 각 텍스트 포인트에 대한 원을 생성함.
  for (let i = 0; i < letters.length; i++) {
    let letter = letters[i];
    for (let j = 0; j < LETTER_CIRCLE_MULTIPLIER; j++) {
      let group = random(['groupA', 'groupB', 'groupC', 'groupD']);
      circles[group].push(
        new Circle(letter.x, letter.y, _options[random(['a', 'b', 'c', 'd'])])
      );
    }
  }
}

function draw() {
  background(0, 0, 0, 30); // 배경을 어두운 색으로 설정하고 조금 투명하게 만들어 흔적(잔상)이 남도록 함.

  // 마우스 Y좌표에 따라 꼬리의 길이를 조정함.
  _trailInteractive = map(mouseY, 0, height, 0, 1);

  // 마우스 X좌표에 따라 원형 정도와 자유도를 조정함.
  let freedomFactor = map(mouseX, 0, width, 0.5, 2);

  // 각 그룹의 원그리기 업데이트해줌.
  moveAndDrawCircles(circles.groupA, freedomFactor, 0.1, 0.05); // 회전 범위 다르게 적용
  moveAndDrawCircles(circles.groupB, freedomFactor, 0.2, 0.1);
  moveAndDrawCircles(circles.groupC, freedomFactor, 0.3, 0.15);
  moveAndDrawCircles(circles.groupD, freedomFactor, 0.4, 0.2);

  // 입력된 키가 있으면 텍스트를 그리도록 해줌.
  if (letters.length > 0) {
    for (let i = 0; i < letters.length; i++) {
      let letter = letters[i];
      for (let j = 0; j < letter.length; j++) {
        let point = letter[j];
        fill(255, 0, 0);
        ellipse(point.x, point.y, 5, 5); // 텍스트 포인트에 원을 그리게 함.
      }
    }
  }
}

// 각 그룹의 원을 이동시키고 화면에 그리며, 회전 효과를 추가해줌.
function moveAndDrawCircles(group, freedomFactor, moveFactor, rotationFactor) {
  group.forEach((circle, index) => {
    circle.update(freedomFactor); // 원의 움직임과 충돌을 처리하는부분.
    circle.addTrail(); // 원에 꼬리 추가해줌
    circle.show();

    // 마우스 X 좌표가 낮으면 원이 텍스트 라인으로 돌아오게 함.
    if (mouseX < width / 2 && letters.length > 0) {
      let letterIndex = index % letters.length; // letters의 각 포인트에 대응시킴.
      let targetX = letters[letterIndex].x;
      let targetY = letters[letterIndex].y;

      // 원의 회전 범위 적용해줌.
      let rotationAngle = frameCount * rotationFactor + index * 0.1; // 각 원이 다르게 회전하도록 함.
      circle.position.x = targetX + cos(rotationAngle) * 20; // 텍스트에서 일정 거리만큼 떨어져 회전하도록 함.
      circle.position.y = targetY + sin(rotationAngle) * 20; // 텍스트에서 일정 거리만큼 떨어져 회전하도록 함.
    }

    // 회전 범위를 다르게 적용해줌.
    let rotationAngle = frameCount * rotationFactor;
    circle.position.x += cos(rotationAngle) * 2;
    circle.position.y += sin(rotationAngle) * 2;
  });

  // 마우스 근처에 원형 가이드를 표시하여 인터랙션 힌트를 제공해줌.
  noFill();
  stroke(255, 50);
  ellipse(mouseX, mouseY, 30);
}

function keyPressed() {
  if (key.match(/^[A-Za-z0-9]$/)) {
    // 입력된 키에 해당하는 텍스트의 포인트를 생성해줌.
    letters = font.textToPoints(
      key,
      width / 2 - width / 9,
      height / 2 + height / 6,
      width / 2,
      {
        sampleFactor: 0.1, // 텍스트의 해상도 조정
      }
    );
    createLetterPoints();
  }
}

// 텍스트 포인트를 원으로 변환해줌.
function createLetterPoints() {
  // 각 그룹에 원들을 넣기 전에 초기화해줌.
  circles.groupA = [];
  circles.groupB = [];
  circles.groupC = [];
  circles.groupD = [];

  // 글자에 대한 원 생성해줌.
  for (let i = 0; i < letters.length; i++) {
    let letter = letters[i];
    circles.groupA.push(
      new Circle(letter.x, letter.y, _options[random(['a', 'b', 'c', 'd'])])
    );
    circles.groupB.push(
      new Circle(letter.x, letter.y, _options[random(['a', 'b', 'c', 'd'])])
    );
    circles.groupC.push(
      new Circle(letter.x, letter.y, _options[random(['a', 'b', 'c', 'd'])])
    );
    circles.groupD.push(
      new Circle(letter.x, letter.y, _options[random(['a', 'b', 'c', 'd'])])
    );
  }
}

// 원 클래스 정의해줌.
class Circle {
  constructor(x, y, options) {
    this.position = createVector(x, y); // 원 위치
    this.velocity = createVector(random(-1, 1), random(-1, 1)); // 원 초기 속도
    this.acceleration = createVector(0, 0); // 원 초기 가속도 (0으로 시작)
    this.maxSpeed = 6; // 원 최대 속도
    this.maxForce = options[1] * 5; // 원에 적용되는 최대 힘 (옵션 값에 따라)
    this.repulsionDistance = options[3]; // 반발 거리 (옵션 값에 따라)
    this.hue = random(255); // 원의 색조 (랜덤으로 설정)
    this.saturation = 80; // 초기 채도값
    this.brightness = 255; // 밝기 값을 최대값으로 설정
    this.color = color(this.hue, this.saturation, this.brightness); // 원의 색상 설정
    this.trail = []; // 잔상 배열
    this.totalTrail = 50; // 잔상 최대 길이
  }

  // 원에 힘 적용함.
  applyForce(force) {
    this.acceleration.add(force);
  }

  // 원의 위치와 속도
  update(freedomFactor) {
    this.maxSpeed = map(freedomFactor, 0.5, 4, 20, 50); //최대 속도를 조정
    this.maxForce = map(freedomFactor, 0.5, 4, 20, 50); //최대 힘을 조정

    // 속도에 가속도를 더하고, 속도가 최대 속도를 넘지 않도록 제한함.
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity); // 속도에 따라 원의 위치를 업데이트해줌.

    // 경계에서 원이 벗어나지 않도록 처리해줌.
    if (this.position.x > width) {
      this.position.x = width; // 원의 x 좌표가 화면을 넘어가면 벗어난 위치를 다시 설정함.
      this.velocity.x *= -1; // x 속도를 반전시켜 원이 반사되게 해줌.
    } else if (this.position.x < 0) {
      this.position.x = 0; // 원의 x 좌표가 화면 왼쪽을 벗어나면 다시 설정함.
      this.velocity.x *= -1; // x 속도를 반전시켜 원이 반사되게 해줌.
    }
    if (this.position.y > height) {
      this.position.y = height; // x랑 똑같음 y도 위치 다시설정하게.
      this.velocity.y *= -1;
    } else if (this.position.y < 0) {
      this.position.y = 0;
      this.velocity.y *= -1;
    }

    this.acceleration.mult(0); // 가속도 0으로 초기화해줌.
  }

  //원 잔상 추가해줌.
  addTrail() {
    // 잔상 길이가 설정된 최대값을 초과하면 잔상이 잘리도록 함.
    if (this.trail.length > this.totalTrail * _trailInteractive) {
      const diff = ceil(
        this.trail.length - this.totalTrail * _trailInteractive
      );
      this.trail.splice(0, diff); // 초과되면 잔상 잘리는 부분.
    }
    // 현재 위치에 잔상 추가함.
    this.trail.push({ pos: this.position.copy(), alpha: 255 });
  }

  // 원과 잔상 화면에 표시함.
  show() {
    // 슬라이더 값에 따라 채도 변경
    this.saturation = saturationSlider.value();
    // 채도가 변경된 색상을 설정.
    this.color = color(this.hue, this.saturation, this.brightness);

    fill(this.color);
    ellipse(this.position.x, this.position.y, 5, 5); //원을 그려줌.

    // 잔상 그려줌.
    for (let i = 0; i < this.trail.length; i++) {
      let trailAlpha = this.trail[i].alpha;
      trailAlpha = map(i, 0, this.trail.length, trailAlpha, 0); //잔상의 alpha 값이 점차 감소하도록 함.

      if (trailAlpha > 0) {
        stroke(
          this.color.levels[0],
          this.color.levels[1],
          this.color.levels[2],
          trailAlpha
        ); // 잔상 색 설정하고 alpha 값을 적용함.
        line(
          this.trail[i].pos.x,
          this.trail[i].pos.y,
          this.trail[i + 1]?.pos.x,
          this.trail[i + 1]?.pos.y
        ); // 잔상 점 사이를 선으로 연결해줌.
      }

      // 잔상의 alpha 값을 점차 감소시켜 잔상이 사라지도록 함.
      if (this.trail[i].alpha > 0) {
        this.trail[i].alpha -= 5;
      }
    }
  }
}

// 사용자 안내 메시지 표시해줌.
const version = document.createElement('div');
const txt =
  '마우스로 그래픽을 조절해보세요. <br>키보드를 눌러 글자를 바꿔보세요.'.toUpperCase();
version.innerHTML = `<p style="opacity:1;background-color:black;color:white;display:inline-block;font-family:monospace;position:absolute;left:50%;top:10%;transform:translate(-50%,-10%)">${txt}</p>`;
document.body.appendChild(version);
