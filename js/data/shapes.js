export const SHAPES = [
    // Basics
    { name: "1", color: "bg-rose-500", layout: [[1]] },
    { name: "2h", color: "bg-cyan-500", layout: [[1, 1]] },
    { name: "2v", color: "bg-cyan-500", layout: [[1], [1]] },
    { name: "3h", color: "bg-emerald-500", layout: [[1, 1, 1]] },
    {
        name: "3v",
        color: "bg-emerald-500",
        layout: [[1], [1], [1]],
    },
    { name: "4h", color: "bg-sky-500", layout: [[1, 1, 1, 1]] },
    {
        name: "4v",
        color: "bg-sky-500",
        layout: [[1], [1], [1], [1]],
    },
    { name: "5h", color: "bg-teal-500", layout: [[1, 1, 1, 1, 1]] },
    {
        name: "5v",
        color: "bg-teal-500",
        layout: [[1], [1], [1], [1], [1]],
    },

    // Rects
    {
        name: "2x2",
        color: "bg-amber-500",
        layout: [
            [1, 1],
            [1, 1],
        ],
    },
    {
        name: "3x3",
        color: "bg-fuchsia-500",
        layout: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
        ],
    },
    {
        name: "2x3",
        color: "bg-orange-500",
        layout: [
            [1, 1],
            [1, 1],
            [1, 1],
        ],
    },
    {
        name: "3x2",
        color: "bg-orange-500",
        layout: [
            [1, 1, 1],
            [1, 1, 1],
        ],
    },

    // L
    {
        name: "L0",
        color: "bg-purple-500",
        layout: [
            [1, 0],
            [1, 0],
            [1, 1],
        ],
    },
    {
        name: "L1",
        color: "bg-purple-500",
        layout: [
            [1, 1, 1],
            [1, 0, 0],
        ],
    },
    {
        name: "L2",
        color: "bg-purple-500",
        layout: [
            [1, 1],
            [0, 1],
            [0, 1],
        ],
    },
    {
        name: "L3",
        color: "bg-purple-500",
        layout: [
            [0, 0, 1],
            [1, 1, 1],
        ],
    },

    // J
    {
        name: "J0",
        color: "bg-indigo-500",
        layout: [
            [0, 1],
            [0, 1],
            [1, 1],
        ],
    },
    {
        name: "J1",
        color: "bg-indigo-500",
        layout: [
            [1, 0, 0],
            [1, 1, 1],
        ],
    },
    {
        name: "J2",
        color: "bg-indigo-500",
        layout: [
            [1, 1],
            [1, 0],
            [1, 0],
        ],
    },
    {
        name: "J3",
        color: "bg-indigo-500",
        layout: [
            [1, 1, 1],
            [0, 0, 1],
        ],
    },

    // T
    {
        name: "T0",
        color: "bg-violet-500",
        layout: [
            [1, 1, 1],
            [0, 1, 0],
        ],
    },
    {
        name: "T1",
        color: "bg-violet-500",
        layout: [
            [0, 1],
            [1, 1],
            [0, 1],
        ],
    },
    {
        name: "T2",
        color: "bg-violet-500",
        layout: [
            [0, 1, 0],
            [1, 1, 1],
        ],
    },
    {
        name: "T3",
        color: "bg-violet-500",
        layout: [
            [1, 0],
            [1, 1],
            [1, 0],
        ],
    },

    // Z / S
    {
        name: "Z0",
        color: "bg-rose-500",
        layout: [
            [1, 1, 0],
            [0, 1, 1],
        ],
    },
    {
        name: "Z1",
        color: "bg-rose-500",
        layout: [
            [0, 1],
            [1, 1],
            [1, 0],
        ],
    },
    {
        name: "S0",
        color: "bg-lime-500",
        layout: [
            [0, 1, 1],
            [1, 1, 0],
        ],
    },
    {
        name: "S1",
        color: "bg-lime-500",
        layout: [
            [1, 0],
            [1, 1],
            [0, 1],
        ],
    },

    // Plus & Cross
    {
        name: "+",
        color: "bg-emerald-500",
        layout: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0],
        ],
    },
    {
        name: "Cross0",
        color: "bg-green-500",
        layout: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0],
            [0, 1, 0],
        ],
    },
    {
        name: "Cross1",
        color: "bg-green-500",
        layout: [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0],
        ],
    },
    {
        name: "Cross2",
        color: "bg-green-500",
        layout: [
            [0, 1, 0, 0],
            [1, 1, 1, 1],
            [0, 1, 0, 0],
        ],
    },
    {
        name: "Cross3",
        color: "bg-green-500",
        layout: [
            [0, 0, 1, 0],
            [1, 1, 1, 1],
            [0, 0, 1, 0],
        ],
    },
    {
        name: "BigPlus",
        color: "bg-teal-400",
        layout: [
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [1, 1, 1, 1, 1],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
        ],
    },

    // U
    {
        name: "U0",
        color: "bg-amber-500",
        layout: [
            [1, 0, 1],
            [1, 1, 1],
        ],
    },
    {
        name: "U1",
        color: "bg-amber-500",
        layout: [
            [1, 1],
            [1, 0],
            [1, 1],
        ],
    },
    {
        name: "U2",
        color: "bg-amber-500",
        layout: [
            [1, 1, 1],
            [1, 0, 1],
        ],
    },
    {
        name: "U3",
        color: "bg-amber-500",
        layout: [
            [1, 1],
            [0, 1],
            [1, 1],
        ],
    },

    // P
    {
        name: "P0",
        color: "bg-yellow-400",
        layout: [
            [1, 1],
            [1, 1],
            [1, 0],
        ],
    },
    {
        name: "P1",
        color: "bg-yellow-400",
        layout: [
            [1, 1, 1],
            [0, 1, 1],
        ],
    },
    {
        name: "P2",
        color: "bg-yellow-400",
        layout: [
            [0, 1],
            [1, 1],
            [1, 1],
        ],
    },
    {
        name: "P3",
        color: "bg-yellow-400",
        layout: [
            [1, 1, 0],
            [1, 1, 1],
        ],
    },

    // b
    {
        name: "b0",
        color: "bg-yellow-400",
        layout: [
            [1, 1],
            [1, 1],
            [0, 1],
        ],
    },
    {
        name: "b1",
        color: "bg-yellow-400",
        layout: [
            [0, 1, 1],
            [1, 1, 1],
        ],
    },
    {
        name: "b2",
        color: "bg-yellow-400",
        layout: [
            [1, 0],
            [1, 1],
            [1, 1],
        ],
    },
    {
        name: "b3",
        color: "bg-yellow-400",
        layout: [
            [1, 1, 1],
            [1, 1, 0],
        ],
    },

    // Diagonals & Stairs
    {
        name: "Stair0",
        color: "bg-indigo-500",
        layout: [
            [1, 0, 0],
            [1, 1, 0],
            [0, 1, 1],
        ],
    },
    {
        name: "Stair1",
        color: "bg-indigo-500",
        layout: [
            [0, 0, 1],
            [0, 1, 1],
            [1, 1, 0],
        ],
    },
    {
        name: "Stair2",
        color: "bg-pink-500",
        layout: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 1],
        ],
    },
    {
        name: "Stair3",
        color: "bg-pink-500",
        layout: [
            [0, 1, 1],
            [1, 1, 0],
            [1, 0, 0],
        ],
    },
    {
        name: "Diag2",
        color: "bg-sky-500",
        layout: [
            [1, 0],
            [0, 1],
        ],
    },
    {
        name: "Diag2b",
        color: "bg-sky-500",
        layout: [
            [0, 1],
            [1, 0],
        ],
    },
    {
        name: "Diag3",
        color: "bg-sky-500",
        layout: [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ],
    },
    {
        name: "Diag3b",
        color: "bg-sky-500",
        layout: [
            [0, 0, 1],
            [0, 1, 0],
            [1, 0, 0],
        ],
    },
    {
        name: "Diag4",
        color: "bg-sky-500",
        layout: [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ],
    },
    {
        name: "Diag4b",
        color: "bg-sky-500",
        layout: [
            [0, 0, 0, 1],
            [0, 0, 1, 0],
            [0, 1, 0, 0],
            [1, 0, 0, 0],
        ],
    },

    // Complex / Unique
    {
        name: "Donut",
        color: "bg-fuchsia-500",
        layout: [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1],
        ],
    },
    {
        name: "SquareDonut",
        color: "bg-fuchsia-400",
        layout: [
            [1, 1, 1, 1],
            [1, 0, 0, 1],
            [1, 0, 0, 1],
            [1, 1, 1, 1],
        ],
    },
    {
        name: "SmallCorner0",
        color: "bg-blue-500",
        layout: [
            [1, 1],
            [1, 0],
        ],
    },
    {
        name: "SmallCorner1",
        color: "bg-blue-500",
        layout: [
            [1, 1],
            [0, 1],
        ],
    },
    {
        name: "Corner0",
        color: "bg-blue-300",
        layout: [
            [1, 1, 1],
            [1, 0, 0],
            [1, 0, 0],
        ],
    },
    {
        name: "Corner1",
        color: "bg-blue-300",
        layout: [
            [1, 0, 0],
            [1, 0, 0],
            [1, 1, 1],
        ],
    },
    {
        name: "Corner0",
        color: "bg-blue-300",
        layout: [
            [1, 1, 1],
            [0, 0, 1],
            [0, 0, 1],
        ],
    },
    {
        name: "Corner0",
        color: "bg-blue-300",
        layout: [
            [0, 0, 1],
            [0, 0, 1],
            [1, 1, 1],
        ],
    },
    {
        name: "BigT0",
        color: "bg-violet-500",
        layout: [
            [1, 1, 1],
            [0, 1, 0],
            [0, 1, 0],
        ],
    },
    {
        name: "BigT1",
        color: "bg-violet-500",
        layout: [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 1],
        ],
    },
    {
        name: "BigT2",
        color: "bg-violet-500",
        layout: [
            [1, 0, 0],
            [1, 1, 1],
            [1, 0, 0],
        ],
    },
    {
        name: "BigT3",
        color: "bg-violet-500",
        layout: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 1],
        ],
    },

    // New / Fixed Colors
    {
        name: "BigF",
        color: "bg-gray-400",
        layout: [
            [1, 1, 1],
            [1, 0, 0],
            [1, 1, 0],
            [1, 0, 0],
        ],
    },
    {
        name: "LongL0",
        color: "bg-stone-300",
        layout: [
            [1, 0],
            [1, 0],
            [1, 0],
            [1, 1],
        ],
    },
    {
        name: "LongL1",
        color: "bg-stone-300",
        layout: [
            [1, 1],
            [1, 0],
            [1, 0],
            [1, 0],
        ],
    },
    {
        name: "LongJ0",
        color: "bg-stone-300",
        layout: [
            [0, 1],
            [0, 1],
            [0, 1],
            [1, 1],
        ],
    },
    {
        name: "LongJ1",
        color: "bg-stone-300",
        layout: [
            [1, 1],
            [0, 1],
            [0, 1],
            [0, 1],
        ],
    },
    {
        name: "H",
        color: "bg-red-400",
        layout: [
            [1, 0, 1],
            [1, 1, 1],
            [1, 0, 1],
        ],
    },
    {
        name: "Chair",
        color: "bg-lime-400",
        layout: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 1, 0],
        ],
    },
    {
        name: "Chair2",
        color: "bg-lime-400",
        layout: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 1, 0],
        ],
    },
    {
        name: "Dot3",
        color: "bg-slate-200",
        layout: [
            [1, 0, 1],
            [0, 1, 0],
        ],
    },
    {
        name: "Dot3b",
        color: "bg-slate-200",
        layout: [
            [0, 1, 0],
            [1, 0, 1],
        ],
    },
    {
        name: "C",
        color: "bg-cyan-400",
        layout: [
            [1, 1, 1],
            [1, 0, 0],
            [1, 1, 1],
        ],
    },
    {
        name: "E",
        color: "bg-rose-400",
        layout: [
            [1, 1, 1],
            [1, 0, 0],
            [1, 1, 0],
            [1, 0, 0],
            [1, 1, 1],
        ],
    },
    {
        name: "G",
        color: "bg-emerald-400",
        layout: [
            [0, 1, 1],
            [1, 0, 0],
            [1, 0, 1],
            [1, 1, 1],
        ],
    },
    {
        name: "X",
        color: "bg-violet-400",
        layout: [
            [1, 0, 1],
            [0, 1, 0],
            [1, 0, 1],
        ],
    },
    {
        name: "Y0",
        color: "bg-yellow-600",
        layout: [
            [1, 0, 1],
            [1, 1, 1],
            [0, 1, 0],
        ],
    },
    {
        name: "Y1",
        color: "bg-yellow-500",
        layout: [
            [0, 1, 0],
            [1, 1, 1],
            [1, 0, 1],
        ],
    },
    {
        name: "Tank",
        color: "bg-stone-300",
        layout: [
            [0, 1, 0],
            [1, 1, 1],
            [1, 0, 1],
            [1, 0, 1],
        ],
    },
    {
        name: "Ship0",
        color: "bg-sky-500",
        layout: [
            [0, 0, 1],
            [0, 1, 1],
            [1, 1, 1],
        ],
    },
    {
        name: "Ship1",
        color: "bg-sky-500",
        layout: [
            [1, 1, 1],
            [0, 1, 1],
            [0, 0, 1],
        ],
    },
    {
        name: "Ship2",
        color: "bg-sky-500",
        layout: [
            [1, 0, 0],
            [1, 1, 0],
            [1, 1, 1],
        ],
    },
    {
        name: "Ship3",
        color: "bg-sky-500",
        layout: [
            [1, 1, 1],
            [1, 1, 0],
            [1, 0, 0],
        ],
    },
    {
        name: "Castle0",
        color: "bg-stone-300",
        layout: [
            [1, 0, 1],
            [1, 1, 1],
            [1, 1, 1],
        ],
    },
    {
        name: "Castle1",
        color: "bg-stone-300",
        layout: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 0, 1],
        ],
    },
    {
        name: "BigS0",
        color: "bg-lime-400",
        layout: [
            [0, 0, 1, 1],
            [1, 1, 1, 0],
        ],
    },
    {
        name: "BigS1",
        color: "bg-lime-400",
        layout: [
            [0, 1, 1, 1],
            [1, 1, 0, 0],
        ],
    },
    {
        name: "BigS2",
        color: "bg-lime-400",
        layout: [
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 1],
        ],
    },
    {
        name: "BigS3",
        color: "bg-lime-400",
        layout: [
            [1, 0],
            [1, 0],
            [1, 1],
            [0, 1],
        ],
    },
    {
        name: "BigN0",
        color: "bg-slate-200",
        layout: [
            [1, 1, 0, 0],
            [0, 1, 1, 1],
        ],
    },
    {
        name: "BigN1",
        color: "bg-slate-200",
        layout: [
            [1, 1, 1, 0],
            [0, 0, 1, 1],
        ],
    },
    {
        name: "BigN2",
        color: "bg-slate-200",
        layout: [
            [0, 1],
            [0, 1],
            [1, 1],
            [1, 0],
        ],
    },
    {
        name: "BigN3",
        color: "bg-slate-200",
        layout: [
            [0, 1],
            [1, 1],
            [1, 0],
            [1, 0],
        ],
    },
];