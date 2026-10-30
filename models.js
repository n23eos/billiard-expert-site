const models = [
  {
    "id": "walnut",
    "name": "Тёплая пластика",
    "material": "Орех · оливковое сукно · бронза",
    "alt": "Визуализация стола из ореха с зелёным сукном и изогнутыми опорами",
    "features": [
      {
        "title": "Живая текстура",
        "text": "Рисунок ореха на широком борте.",
        "point": [
          27,
          42
        ],
        "label": [
          5,
          14
        ],
        "end": [
          22,
          25
        ]
      },
      {
        "title": "Бронзовый акцент",
        "text": "Тёплый металл вокруг луз.",
        "point": [
          69,
          49
        ],
        "label": [
          76,
          13
        ],
        "end": [
          76,
          25
        ]
      },
      {
        "title": "Скульптурные опоры",
        "text": "Плавный изгиб основания.",
        "point": [
          30,
          59
        ],
        "label": [
          5,
          77
        ],
        "end": [
          24,
          78
        ]
      }
    ],
    "shortLabel": "Орех",
    "category": "modern"
  },
  {
    "id": "stone",
    "name": "Архитектура камня",
    "material": "Травертин · графитовое сукно · тёплый металл",
    "alt": "Визуализация светлого стола из травертина с графитовым сукном",
    "features": [
      {
        "title": "Природный рисунок",
        "text": "Пористая фактура светлого камня.",
        "point": [
          25,
          46
        ],
        "label": [
          5,
          14
        ],
        "end": [
          22,
          25
        ]
      },
      {
        "title": "Графитовое поле",
        "text": "Тёмное поле в светлой раме.",
        "point": [
          65,
          40
        ],
        "label": [
          76,
          13
        ],
        "end": [
          76,
          25
        ]
      },
      {
        "title": "Монолитный силуэт",
        "text": "Геометрия массивных оснований.",
        "point": [
          28,
          61
        ],
        "label": [
          5,
          77
        ],
        "end": [
          24,
          78
        ]
      }
    ],
    "shortLabel": "Камень",
    "category": "modern"
  },
  {
    "id": "noir",
    "name": "Графичная геометрия",
    "material": "Тёмное дерево · бордовое сукно · бронза",
    "alt": "Визуализация тёмного стола с бордовым сукном и наклонными опорами",
    "features": [
      {
        "title": "Тонкая линия",
        "text": "Бронзовая вставка вдоль борта.",
        "point": [
          55,
          47
        ],
        "label": [
          5,
          14
        ],
        "end": [
          22,
          25
        ]
      },
      {
        "title": "Глубокий цвет",
        "text": "Бордовое поле и тёмный корпус.",
        "point": [
          69,
          35
        ],
        "label": [
          76,
          13
        ],
        "end": [
          76,
          25
        ]
      },
      {
        "title": "Динамика опор",
        "text": "Наклонные опоры с акцентом металла.",
        "point": [
          30,
          65
        ],
        "label": [
          5,
          77
        ],
        "end": [
          24,
          78
        ]
      }
    ],
    "shortLabel": "Графит",
    "category": "modern"
  },
  {
    "id": "samuraj",
    "name": "Самурай",
    "material": "Деревянная фактура · зелёное сукно",
    "alt": "Визуализация по референсу Самурай",
    "image": "assets/samuraj-studio.webp",
    "catalog": false,
    "source": "https://biliard-expert.ru/biljardnij-stol-samuraj",
    "features": [
      {
        "title": "Рисунок дерева",
        "text": "Фактура на бортах и опорах.",
        "point": [
          40,
          43
        ],
        "label": [
          5,
          14
        ],
        "end": [
          22,
          25
        ]
      },
      {
        "title": "Открытые лузы",
        "text": "Открытые сетки и скобы.",
        "point": [
          59,
          48
        ],
        "label": [
          76,
          13
        ],
        "end": [
          76,
          25
        ]
      },
      {
        "title": "Фигурные опоры",
        "text": "Расширяющиеся книзу опоры.",
        "point": [
          58,
          71
        ],
        "label": [
          5,
          77
        ],
        "end": [
          24,
          78
        ]
      }
    ],
    "reference": true,
    "shortLabel": "Самурай",
    "category": "classic"
  },
  {
    "id": "rococo",
    "name": "Rococo",
    "material": "Светлая отделка · резной орнамент",
    "alt": "Визуализация по референсу Rococo",
    "image": "assets/rococo-studio.webp",
    "catalog": false,
    "source": "https://biliard-expert.ru/biljardnij-stol-rococo",
    "features": [
      {
        "title": "Резной орнамент",
        "text": "Рельефный узор вдоль царги.",
        "point": [
          43,
          48
        ],
        "label": [
          5,
          14
        ],
        "end": [
          22,
          25
        ]
      },
      {
        "title": "Декоративные лузы",
        "text": "Тёмная бахрома на светлом корпусе.",
        "point": [
          64,
          46
        ],
        "label": [
          76,
          13
        ],
        "end": [
          76,
          25
        ]
      },
      {
        "title": "Изогнутые ножки",
        "text": "Плавный контур и резьба.",
        "point": [
          65,
          72
        ],
        "label": [
          5,
          77
        ],
        "end": [
          24,
          78
        ]
      }
    ],
    "reference": true,
    "shortLabel": "Rococo",
    "category": "classic"
  },
  {
    "id": "high-tech",
    "name": "High-tech",
    "material": "Тёмная фактура · металлические акценты",
    "alt": "Визуализация по референсу High-tech",
    "image": "assets/high-tech-studio.webp",
    "catalog": false,
    "source": "https://biliard-expert.ru/biljardnij-stol-high-tech",
    "features": [
      {
        "title": "Геометричный корпус",
        "text": "Прямые линии широких бортов.",
        "point": [
          65,
          53
        ],
        "label": [
          5,
          14
        ],
        "end": [
          22,
          25
        ]
      },
      {
        "title": "Контраст деталей",
        "text": "Светлые накладки на углах.",
        "point": [
          49,
          51
        ],
        "label": [
          76,
          13
        ],
        "end": [
          76,
          25
        ]
      },
      {
        "title": "Архитектурные опоры",
        "text": "Вертикальные панели и металл.",
        "point": [
          48,
          71
        ],
        "label": [
          5,
          77
        ],
        "end": [
          24,
          78
        ]
      }
    ],
    "reference": true,
    "shortLabel": "High-tech",
    "category": "modern"
  },
  {
    "id": "edenvale",
    "name": "Edenvale",
    "material": "Тёмная отделка · лаконичный силуэт",
    "alt": "Визуализация по референсу Edenvale",
    "image": "assets/edenvale-studio.webp",
    "catalog": false,
    "source": "https://biliard-expert.ru/biljardnij-stol-edenvale",
    "features": [
      {
        "title": "Чистая линия",
        "text": "Лаконичный борт без резьбы.",
        "point": [
          58,
          47
        ],
        "label": [
          5,
          14
        ],
        "end": [
          22,
          25
        ]
      },
      {
        "title": "Светлый акцент",
        "text": "Светлая полоса под полем.",
        "point": [
          68,
          47
        ],
        "label": [
          76,
          13
        ],
        "end": [
          76,
          25
        ]
      },
      {
        "title": "Плавные опоры",
        "text": "Сужающиеся ножки с наконечниками.",
        "point": [
          40,
          70
        ],
        "label": [
          5,
          77
        ],
        "end": [
          24,
          78
        ]
      }
    ],
    "reference": true,
    "shortLabel": "Edenvale",
    "category": "modern"
  }
];
