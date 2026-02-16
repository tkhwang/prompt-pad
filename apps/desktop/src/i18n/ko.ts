import type { en } from "./en";

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends object ? DeepStringify<T[K]> : string;
};

export const ko: DeepStringify<typeof en> = {
  app: {
    title: "Prompt Pad",
    loading: "로딩 중...",
    loading_prompts: "프롬프트 로딩 중...",
  },

  new_prompt: {
    untitled: "제목 없음",
  },

  onboarding: {
    welcome_title: "Prompt Pad에 오신 것을 환영합니다",
    welcome_subtitle: "몇 가지 간단한 설정을 진행합니다.",
    welcome_hint: "모든 설정은 나중에 설정에서 변경할 수 있습니다.",
    language_title: "언어를 선택하세요",
    language_description: "인터페이스 언어를 선택합니다.",
    folder_title: "프롬프트를 어디에 저장할까요?",
    folder_description: "프롬프트는 마크다운 파일로 저장됩니다.",
    folder_browse: "찾아보기",
    theme_title: "테마를 선택하세요",
    theme_description: "원하는 스타일을 고르세요.",
    color_theme_title: "색상 테마를 선택하세요",
    color_theme_description: "인터페이스의 색상 팔레트를 선택합니다.",
    font_title: "글꼴 크기를 선택하세요",
    font_description: "프롬프트 에디터에 사용할 글꼴 크기를 선택합니다.",
    font_sample: "가나다라",
    back: "이전",
    next: "다음",
    finish: "시작하기",
    browse_dialog_title: "프롬프트 저장 폴더 선택",
  },

  settings: {
    title: "설정",
    category_general: "일반",
    category_appearance: "외관",
    setup_wizard: "설정 마법사",
    setup_wizard_description: "초기 설정 마법사를 다시 실행합니다",
    rerun: "다시 실행",
    prompt_dir_label: "프롬프트 저장 폴더",
    prompt_dir_browse: "찾아보기",
    prompt_dir_apply: "폴더 변경 적용",
    prompt_dir_description: "이 폴더에 프롬프트가 마크다운 파일로 저장됩니다.",
    theme_label: "모드",
    theme_description: "라이트, 다크 또는 시스템 모드를 선택합니다.",
    color_theme_label: "색상 테마",
    color_theme_description: "인터페이스의 색상 팔레트를 선택합니다.",
    font_label: "글꼴 크기",
    font_description: "에디터에 사용할 글꼴 크기를 선택합니다.",
    language_label: "언어",
    language_description: "인터페이스 언어를 선택합니다.",
    close: "닫기",
    browse_dialog_title: "프롬프트 저장 폴더 선택",
  },

  theme: {
    light: "라이트",
    dark: "다크",
    system: "시스템",
    zinc: "Zinc",
    zinc_description: "순수 무채색",
    slate: "Slate",
    slate_description: "쿨 블루-그레이",
    stone: "Stone",
    stone_description: "따뜻한 베이지",
    rose: "Rose",
    rose_description: "부드러운 핑크",
    sage: "Sage",
    sage_description: "세이지 그린",
    violet: "Violet",
    violet_description: "퍼플 톤",
  },

  language: {
    en: "English",
    ko: "한국어",
  },

  status: {
    new_prompt: "새 프롬프트",
    new_topic: "새 토픽",
    copy: "복사",
    select_topic: "토픽 선택",
    settings: "설정",
  },

  template: {
    title: "템플릿 변수",
    placeholder: "{{name}} 입력...",
    copy: "변수 적용 후 복사",
  },

  editor: {
    empty: "프롬프트를 선택하거나 새로 만드세요",
    placeholder_title: "프롬프트 제목...",
    placeholder_body:
      "여기에 프롬프트를 작성하세요... {{variable_name}} 형식으로 템플릿 변수를 사용할 수 있습니다.",
    copy: "복사",
    copied: "복사됨!",
    view: "보기",
    edit: "편집",
  },

  sidebar: {
    empty: "프롬프트가 없습니다. +를 눌러 만드세요.",
    search_placeholder: "프롬프트 검색...",
    new_prompt: "새 프롬프트",
  },

  topic_panel: {
    all_prompts: "모든 프롬프트",
    create: "새 토픽",
    create_placeholder: "토픽 이름",
    rename: "이름 변경",
    delete: "삭제",
    delete_confirm: '"{{name}}"과(와) 모든 프롬프트를 삭제할까요?',
    delete_description: "이 작업은 되돌릴 수 없습니다.",
    cancel: "취소",
  },

  prompt: {
    delete_confirm: '"{{title}}"을(를) 삭제할까요?',
    delete_description: "이 작업은 되돌릴 수 없습니다.",
    delete_cancel: "취소",
    delete_action: "삭제",
  },
};
