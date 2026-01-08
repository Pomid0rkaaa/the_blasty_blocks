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
            [1, 1],
            [1, 1],
            [0, 1],
        ],
    },

    // Diagonals & Stairs
    {
        name: "Stair",
        color: "bg-indigo-500",
        layout: [
            [1, 0, 0],
            [1, 1, 0],
            [0, 1, 1],
        ],
    },
    {
        name: "Stair2",
        color: "bg-indigo-500",
        layout: [
            [0, 0, 1],
            [0, 1, 1],
            [1, 1, 0],
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
        name: "Corner",
        color: "bg-blue-500",
        layout: [
            [1, 1],
            [1, 0],
        ],
    },
    {
        name: "Corner2",
        color: "bg-blue-500",
        layout: [
            [1, 1],
            [0, 1],
        ],
    },
    {
        name: "BigT",
        color: "bg-violet-500",
        layout: [
            [1, 1, 1],
            [0, 1, 0],
            [0, 1, 0],
        ],
    },
    {
        name: "Snake5",
        color: "bg-pink-500",
        layout: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 1],
        ],
    },
    {
        name: "Snake5b",
        color: "bg-pink-500",
        layout: [
            [0, 1, 1],
            [1, 1, 0],
            [1, 0, 0],
        ],
    },
    {
        name: "LongL",
        color: "bg-stone-300",
        layout: [
            [1, 0],
            [1, 0],
            [1, 0],
            [1, 1],
        ],
    },
    {
        name: "LongJ",
        color: "bg-stone-300",
        layout: [
            [0, 1],
            [0, 1],
            [0, 1],
            [1, 1],
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
        name: "Corner3",
        color: "bg-blue-300",
        layout: [
            [1, 1, 1],
            [1, 0, 0],
            [1, 0, 0],
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
        name: "X",
        color: "bg-violet-400",
        layout: [
            [1, 0, 1],
            [0, 1, 0],
            [1, 0, 1],
        ],
    },
    {
        name: "Y",
        color: "bg-yellow-600",
        layout: [
            [1, 0, 1],
            [1, 1, 1],
            [0, 1, 0],
        ],
    },
    {
        name: "Spy",
        color: "bg-red-500",
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
        name: "Ship",
        color: "bg-sky-500",
        layout: [
            [0, 0, 1],
            [0, 1, 1],
            [1, 1, 1],
        ],
    },
    {
        name: "Castle",
        color: "bg-stone-300",
        layout: [
            [1, 0, 1],
            [1, 1, 1],
            [1, 1, 1],
        ],
    },
];