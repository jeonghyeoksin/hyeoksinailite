export interface PatchNote {
  version: string;
  date: string;
  updates: string[];
  isLatest?: boolean;
}

export const patchNotes: PatchNote[] = [
  {
    version: 'v1.1.2',
    date: '2026.04.28',
    updates: [
      '상세페이지 생성 엔진 "나노바나나2" 최적화 적용',
      '한국어 텍스트 깨짐 방지 알고리즘 강화',
      '패치노트 시스템 실시간 동기화 구조 개선',
      'API 사용량 및 비용 가이드 UI 시인성 개선'
    ],
    isLatest: true
  },
  {
    version: 'v1.1.1',
    date: '2026.04.27',
    updates: [
      '상세페이지 및 이미지 생성 모델 최적화 (오류 해결)',
      '실시간 패치노트 기능 추가',
      '사이드바 "오류 및 유지보수 문의"로 명칭 변경',
      '배너 "혁신 AI 플랫폼 바로가기"로 명칭 변경'
    ]
  },
  {
    version: 'v1.1.0',
    date: '2026.04.24',
    updates: [
      '모바일 반응형 UI 대폭 개선 (하단 탭바 도입)',
      '카드뉴스 생성 시 "AI 추천 (Auto)" 장수 옵션 추가',
      '메뉴 아이콘 및 텍스트 가독성 최적화'
    ]
  },
  {
    version: 'v1.0.5',
    date: '2026.04.22',
    updates: [
      '카드뉴스 디자인 스타일 12종으로 전격 확장',
      '유료 API Key 사용 권장 안내 및 가이드 보완',
      '기능별 무료/유료 배지 표시 추가'
    ]
  }
];
