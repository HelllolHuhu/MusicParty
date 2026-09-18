import React from 'react';

// HEAD PARTS
export const HeadParts = {
  head_1: ({ color = '#f9c9b6' }) => (
    <g id="head_1">
      {/* Neck */}
      <path d="M82 145 L82 185 L118 185 L118 145 Z" fill={color} />
      <path d="M82 145 C82 145 100 155 118 145 L118 152 C100 162 82 152 82 152 Z" fill="#000000" opacity="0.15" />
      {/* Left Ear */}
      <circle cx="48" cy="115" r="14" fill={color} stroke="#1f2937" strokeWidth="3.5" />
      <path d="M47 110 C44 113 44 118 48 120" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* Right Ear */}
      <circle cx="152" cy="115" r="14" fill={color} stroke="#1f2937" strokeWidth="3.5" />
      <path d="M153 110 C156 113 156 118 152 120" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* Head */}
      <path d="M52 110 C52 65 72 50 100 50 C128 50 148 65 148 110 C148 148 132 165 100 165 C68 165 52 148 52 110 Z" fill={color} stroke="#1f2937" strokeWidth="4" strokeLinejoin="round" />
      {/* Nose & Mouth */}
      <path d="M96 118 C98 122 102 122 104 118" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M92 138 C97 142 103 142 108 138" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </g>
  ),
  head_2: ({ color = '#f9c9b6' }) => (
    <g id="head_2">
      {/* Neck */}
      <path d="M78 145 L78 185 L122 185 L122 145 Z" fill={color} />
      <path d="M78 145 C78 145 100 156 122 145 L122 153 C100 164 78 153 78 153 Z" fill="#000000" opacity="0.15" />
      {/* Ears */}
      <rect x="36" y="102" width="14" height="26" rx="7" fill={color} stroke="#1f2937" strokeWidth="3.5" />
      <rect x="150" y="102" width="14" height="26" rx="7" fill={color} stroke="#1f2937" strokeWidth="3.5" />
      {/* Head */}
      <path d="M52 100 C52 60 70 48 100 48 C130 48 148 60 148 100 L148 128 L126 160 L74 160 L52 128 Z" fill={color} stroke="#1f2937" strokeWidth="4" strokeLinejoin="round" />
      {/* Nose & Mouth */}
      <path d="M95 116 L100 122 L105 116" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M90 140 L110 140" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </g>
  ),
  head_3: ({ color = '#f9c9b6' }) => (
    <g id="head_3">
      {/* Neck */}
      <path d="M84 145 L84 185 L116 185 L116 145 Z" fill={color} />
      <path d="M84 145 C84 145 100 154 116 145 L116 151 C100 160 84 151 84 151 Z" fill="#000000" opacity="0.15" />
      {/* Ears */}
      <circle cx="48" cy="112" r="13" fill={color} stroke="#1f2937" strokeWidth="3.5" />
      <circle cx="152" cy="112" r="13" fill={color} stroke="#1f2937" strokeWidth="3.5" />
      {/* Head */}
      <path d="M50 100 C50 58 72 46 100 46 C128 46 150 58 150 100 C150 126 130 152 100 166 C70 152 50 126 50 100 Z" fill={color} stroke="#1f2937" strokeWidth="4" strokeLinejoin="round" />
      {/* Nose & Mouth */}
      <circle cx="100" cy="120" r="2.5" fill="#1f2937" />
      <path d="M94 140 C97 143 103 143 106 140" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
  )
};

// EYE PARTS
export const EyesParts = {
  eyes_1: ({ color = '#3b82f6' }) => (
    <g id="eyes_1">
      {/* Eyebrows */}
      <path d="M66 84 C72 80 82 81 88 85" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M134 84 C128 80 118 81 112 85" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Left Eye */}
      <ellipse cx="76" cy="98" rx="13" ry="11" fill="#ffffff" stroke="#1f2937" strokeWidth="3" />
      <circle cx="76" cy="98" r="7.5" fill={color} />
      <circle cx="76" cy="98" r="4" fill="#111827" />
      <circle cx="74" cy="95" r="2.2" fill="#ffffff" />
      {/* Right Eye */}
      <ellipse cx="124" cy="98" rx="13" ry="11" fill="#ffffff" stroke="#1f2937" strokeWidth="3" />
      <circle cx="124" cy="98" r="7.5" fill={color} />
      <circle cx="124" cy="98" r="4" fill="#111827" />
      <circle cx="122" cy="95" r="2.2" fill="#ffffff" />
    </g>
  ),
  eyes_2: ({ color = '#3b82f6' }) => (
    <g id="eyes_2">
      {/* Eyebrows */}
      <path d="M64 83 Q76 80 88 86" stroke="#1f2937" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M136 81 Q124 77 112 83" stroke="#1f2937" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      {/* Left Eye */}
      <path d="M64 99 C64 92 88 92 88 99 C88 107 64 107 64 99 Z" fill="#ffffff" stroke="#1f2937" strokeWidth="3" />
      <ellipse cx="76" cy="99" rx="6.5" ry="5.5" fill={color} />
      <circle cx="76" cy="99" r="3" fill="#111827" />
      <circle cx="74.5" cy="97.5" r="1.5" fill="#ffffff" />
      <path d="M62 97 Q76 93 90 98" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Right Eye */}
      <path d="M112 99 C112 92 136 92 136 99 C136 107 112 107 112 99 Z" fill="#ffffff" stroke="#1f2937" strokeWidth="3" />
      <ellipse cx="124" cy="99" rx="6.5" ry="5.5" fill={color} />
      <circle cx="124" cy="99" r="3" fill="#111827" />
      <circle cx="122.5" cy="97.5" r="1.5" fill="#ffffff" />
      <path d="M110 98 Q124 93 138 97" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" fill="none" />
    </g>
  ),
  eyes_3: ({ color = '#3b82f6' }) => (
    <g id="eyes_3">
      {/* Cute Eyebrows */}
      <path d="M68 82 Q78 78 88 83" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M132 82 Q122 78 112 83" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Left Eye */}
      <ellipse cx="76" cy="100" rx="14" ry="14" fill="#ffffff" stroke="#1f2937" strokeWidth="3.5" />
      <ellipse cx="76" cy="101" rx="10" ry="11" fill={color} />
      <ellipse cx="76" cy="103" rx="6.5" ry="7" fill="#111827" />
      <circle cx="73" cy="96" r="3.8" fill="#ffffff" />
      <circle cx="79" cy="104" r="2" fill="#ffffff" />
      <path d="M62 96 Q76 88 90 96" stroke="#1f2937" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      {/* Right Eye */}
      <ellipse cx="124" cy="100" rx="14" ry="14" fill="#ffffff" stroke="#1f2937" strokeWidth="3.5" />
      <ellipse cx="124" cy="101" rx="10" ry="11" fill={color} />
      <ellipse cx="124" cy="103" rx="6.5" ry="7" fill="#111827" />
      <circle cx="121" cy="96" r="3.8" fill="#ffffff" />
      <circle cx="127" cy="104" r="2" fill="#ffffff" />
      <path d="M110 96 Q124 88 138 96" stroke="#1f2937" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    </g>
  ),
  eyes_4: ({ color = '#ef4444' }) => (
    <g id="eyes_4">
      {/* Twitchy, wild, unhinged eyebrows */}
      <path d="M62 76 Q76 86 90 76" stroke="#1f2937" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M138 76 Q124 86 110 76" stroke="#1f2937" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      
      {/* Forehead stress wrinkles */}
      <path d="M78 70 Q100 66 122 70" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M84 64 Q100 61 116 64" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />

      {/* Left Eye - Wide Bloodshot Red Sclera */}
      <ellipse cx="76" cy="97" rx="14" ry="13" fill="#ffe4e6" stroke="#1f2937" strokeWidth="3.5" />
      {/* Squiggly Red Bloodshot Veins */}
      <path d="M63 93 Q69 95 71 91 M64 102 Q70 99 72 104 M89 92 Q83 95 81 91 M88 103 Q82 100 80 105" stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M66 97 L71 96 M86 97 L81 96" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Iris */}
      <ellipse cx="76" cy="97" rx="6" ry="6" fill={color} />
      {/* Pinpoint twitching pupil */}
      <circle cx="76" cy="97" r="2.4" fill="#111827" />
      <circle cx="74.5" cy="95.5" r="1" fill="#ffffff" />
      {/* Heavy Reddish-Purple Bags Underneath */}
      <path d="M62 108 C68 116 84 116 90 108" stroke="#991b1b" strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M65 112 C71 118 81 118 87 112" stroke="#581c87" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5" />

      {/* Right Eye - Wild & Jittery */}
      <ellipse cx="124" cy="97" rx="14" ry="13" fill="#ffe4e6" stroke="#1f2937" strokeWidth="3.5" />
      {/* Squiggly Red Bloodshot Veins */}
      <path d="M111 93 Q117 95 119 91 M112 102 Q118 99 120 104 M137 92 Q131 95 129 91 M136 103 Q130 100 128 105" stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M114 97 L119 96 M134 97 L129 96" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Iris */}
      <ellipse cx="124" cy="97" rx="6" ry="6" fill={color} />
      {/* Pinpoint twitching pupil */}
      <circle cx="124" cy="97" r="2.4" fill="#111827" />
      <circle cx="122.5" cy="95.5" r="1" fill="#ffffff" />
      {/* Heavy Reddish-Purple Bags Underneath */}
      <path d="M110 108 C116 116 132 116 138 108" stroke="#991b1b" strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M113 112 C119 118 129 118 135 112" stroke="#581c87" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5" />
    </g>
  )
};

// BEARD PARTS
export const BeardParts = {
  beard_1: ({ color = '#18181b' }) => (
    <g id="beard_1">
      <path d="M50 115 C48 140 56 168 80 180 C92 186 108 186 120 180 C144 168 152 140 150 115 C146 128 138 138 126 142 C120 148 114 150 100 150 C86 150 80 148 74 142 C62 138 54 128 50 115 Z" fill={color} stroke="#1f2937" strokeWidth="4" strokeLinejoin="round" />
      <path d="M82 134 C88 128 98 128 100 133 C102 128 112 128 118 134 C122 138 116 144 100 144 C84 144 78 138 82 134 Z" fill={color} stroke="#1f2937" strokeWidth="3" strokeLinejoin="round" />
    </g>
  ),
  beard_2: ({ color = '#18181b' }) => (
    <g id="beard_2">
      <path d="M84 145 C86 168 94 176 100 178 C106 176 114 168 116 145 C110 150 90 150 84 145 Z" fill={color} stroke="#1f2937" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M96 142 L104 142 L100 148 Z" fill={color} />
      <path d="M86 133 C92 130 97 131 99 135 C101 131 106 130 114 133 C116 137 110 140 100 140 C90 140 84 137 86 133 Z" fill={color} stroke="#1f2937" strokeWidth="3" strokeLinejoin="round" />
    </g>
  ),
  beard_3: ({ color = '#18181b' }) => (
    <g id="beard_3">
      <path d="M72 132 C82 126 95 130 100 136 C105 130 118 126 128 132 C134 136 134 143 126 143 C114 143 105 137 100 140 C95 137 86 143 74 143 C66 143 66 136 72 132 Z" fill={color} stroke="#1f2937" strokeWidth="3.5" strokeLinejoin="round" />
    </g>
  )
};

// HAIR PARTS
export const HairParts = {
  hair_1: ({ color = '#18181b' }) => (
    <g id="hair_1">
      <path d="M48 95 C46 70 54 48 70 38 C80 32 92 28 108 30 C125 32 142 42 152 60 C156 68 155 85 152 95 C146 80 136 72 120 72 C105 72 98 80 88 78 C78 76 68 84 48 95 Z" fill={color} stroke="#1f2937" strokeWidth="4" strokeLinejoin="round" />
      <path d="M78 45 C86 52 92 65 92 72" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />
      <path d="M106 38 C116 46 122 58 124 68" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />
    </g>
  ),
  hair_2: ({ color = '#18181b' }) => (
    <g id="hair_2">
      <circle cx="50" cy="56" r="14" fill={color} stroke="#1f2937" strokeWidth="3" />
      <circle cx="76" cy="38" r="16" fill={color} stroke="#1f2937" strokeWidth="3" />
      <circle cx="106" cy="34" r="17" fill={color} stroke="#1f2937" strokeWidth="3" />
      <circle cx="136" cy="42" r="16" fill={color} stroke="#1f2937" strokeWidth="3" />
      <circle cx="156" cy="62" r="14" fill={color} stroke="#1f2937" strokeWidth="3" />
      <path d="M42 98 C34 90 32 74 38 62 C44 50 56 42 66 38 C76 30 92 28 108 30 C124 32 140 38 152 48 C164 58 168 76 162 90 C158 100 152 104 148 95 C142 78 132 68 100 68 C68 68 56 80 42 98 Z" fill={color} stroke="#1f2937" strokeWidth="4" strokeLinejoin="round" />
      <path d="M48 92 C58 78 76 72 100 72 C124 72 142 78 152 92" stroke="#1f2937" strokeWidth="4" fill="none" />
    </g>
  ),
  hair_3: ({ color = '#18181b' }) => (
    <g id="hair_3">
      <path d="M52 75 L62 82 M52 83 L62 90 M148 75 L138 82 M148 83 L138 90" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M84 72 L86 24 L98 42 L106 18 L114 44 L122 28 L122 72 C114 68 94 68 84 72 Z" fill={color} stroke="#1f2937" strokeWidth="4" strokeLinejoin="round" />
      <path d="M104 26 L108 44 L114 65" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.35" />
    </g>
  ),
  hair_4: ({ color = '#18181b' }) => (
    <g id="hair_4">
      {/* Durag Cap Dome */}
      <path d="M48 96 C46 54 68 38 100 38 C132 38 154 54 152 96 C142 82 126 78 100 78 C74 78 58 82 48 96 Z" fill={color} stroke="#1f2937" strokeWidth="4" strokeLinejoin="round" />
      
      {/* Back flap / cape draping down side */}
      <path d="M146 94 C156 108 166 138 162 176 C154 178 146 172 142 158 C146 135 144 112 140 96 Z" fill={color} stroke="#1f2937" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M142 96 C148 112 152 138 148 160 C143 162 138 155 137 146 C140 128 139 110 137 98 Z" fill="#000000" opacity="0.25" />

      {/* Forehead Band */}
      <path d="M46 90 C68 80 132 80 154 90 L154 98 C132 88 68 88 46 98 Z" fill={color} stroke="#1f2937" strokeWidth="3" strokeLinejoin="round" />
      <path d="M46 94 C68 85 132 85 154 94" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.35" />

      {/* Center Seam */}
      <path d="M100 38 L100 78" stroke="#ffffff" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
      
      {/* Silky Shine Highlight */}
      <path d="M68 52 C80 45 120 45 132 52" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.3" />
      
      {/* Knot on right temple */}
      <ellipse cx="146" cy="94" rx="5" ry="4" fill={color} stroke="#1f2937" strokeWidth="2.5" />
    </g>
  )
};

// ACCESSORY PARTS
export const AccessoryParts = {
  acc_1: () => (
    <g id="acc_1">
      <path d="M92 97 L108 97" stroke="#111827" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M48 96 L60 97 M152 96 L140 97" stroke="#111827" strokeWidth="4" strokeLinecap="round" fill="none" />
      <rect x="58" y="88" width="34" height="24" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
      <path d="M64 92 L82 92 M64 96 L74 96" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
      <rect x="108" y="88" width="34" height="24" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
      <path d="M114 92 L132 92 M114 96 L124 96" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
    </g>
  ),
  acc_2: () => (
    <g id="acc_2">
      <path d="M38 105 C38 48 64 30 100 30 C136 30 162 48 162 105" stroke="#374151" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M44 100 C44 54 68 38 100 38 C132 38 156 54 156 100" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" fill="none" />
      <rect x="28" y="96" width="18" height="34" rx="8" fill="#1f2937" stroke="#111827" strokeWidth="3" />
      <rect x="32" y="102" width="10" height="22" rx="4" fill="#f59e0b" />
      <rect x="154" y="96" width="18" height="34" rx="8" fill="#1f2937" stroke="#111827" strokeWidth="3" />
      <rect x="158" y="102" width="10" height="22" rx="4" fill="#f59e0b" />
    </g>
  ),
  acc_3: () => (
    // Gold Chain (Without earrings)
    <g id="acc_3">
      <path d="M72 165 C80 188 120 188 128 165" stroke="#eab308" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M72 165 C80 188 120 188 128 165" stroke="#fde047" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" fill="none" />
      <path d="M100 180 L103 188 L111 189 L105 194 L107 201 L100 197 L93 201 L95 194 L89 189 L97 188 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
    </g>
  ),
  acc_4: () => (
    // Shiny Earrings on both ears
    <g id="acc_4">
      {/* Left Earring */}
      <circle cx="43" cy="122" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
      <circle cx="43" cy="122" r="2.5" fill="#ffffff" />
      <path d="M43 118 L43 126 M39 122 L47 122" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
      
      {/* Right Earring */}
      <circle cx="157" cy="122" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
      <circle cx="157" cy="122" r="2.5" fill="#ffffff" />
      <path d="M157 118 L157 126 M153 122 L161 122" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
    </g>
  ),
  acc_5: () => (
    // Cigar
    <g id="acc_5">
      {/* Rising Animated / Stylized Smoke Swirls */}
      <path d="M148 122 C155 110 146 100 156 86 C164 74 154 62 164 46" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M150 118 C158 106 152 94 162 82 C168 72 160 60 168 48" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.55" />
      <circle cx="164" cy="46" r="3.5" fill="#e2e8f0" opacity="0.7" />
      <circle cx="152" cy="114" r="1.2" fill="#f59e0b" />
      
      {/* Cigar Main Brown Body */}
      <path d="M100 139 L142 127 L144 135 L102 147 Z" fill="#78350f" stroke="#1f2937" strokeWidth="2.8" strokeLinejoin="round" />
      
      {/* Tobacco leaf wrapper lines */}
      <path d="M110 137 L111 145 M122 133 L123 141 M134 130 L135 138" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" />

      {/* Gold & Red Premium Cigar Band Ring */}
      <path d="M116 135 L124 133 L125 141 L117 143 Z" fill="#eab308" stroke="#1f2937" strokeWidth="1.5" />
      <path d="M119 134 L121 134 L122 142 L120 142 Z" fill="#dc2626" />

      {/* Ash Tip (Gray) */}
      <path d="M142 127 L148 125.5 L150 133.5 L144 135 Z" fill="#71717a" stroke="#1f2937" strokeWidth="1.5" strokeLinejoin="round" />
      
      {/* Glowing Red-Orange Lit Ember */}
      <path d="M142 127 L144 135" stroke="#ea580c" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="145" cy="130" r="1.5" fill="#facc15" />
    </g>
  )
};
