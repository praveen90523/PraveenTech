import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
    const { darkMode, setDarkMode } = useTheme();

    const toggleTheme = () => {
        const newTheme = !darkMode;
        setDarkMode(newTheme);

        localStorage.setItem(
            "theme",
            newTheme ? "dark" : "light"
        );
    };

    return (
        <button
            onClick={toggleTheme}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="
                group
                relative
                w-11
                h-11
                rounded-2xl
                flex
                items-center
                justify-center
                overflow-hidden

                bg-white/80
                dark:bg-slate-900/80

                backdrop-blur-xl

                border
                border-slate-200/70
                dark:border-cyan-900/30

                shadow-sm
                hover:shadow-xl
                hover:shadow-cyan-500/20

                hover:border-cyan-400/40

                transition-all
                duration-300
                ease-out
            "
        >
            {/* Glow Background */}
            <div
                className="
                    absolute
                    inset-0
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity
                    duration-300

                    bg-gradient-to-br
                    from-cyan-500/10
                    via-blue-500/10
                    to-indigo-500/10
                "
            />

            {/* Icon */}
            <div
                className="
                    relative
                    z-10
                    transition-all
                    duration-500
                    ease-in-out
                "
            >
                {darkMode ? (
                    <Sun
                        className="
                            w-5
                            h-5
                            text-amber-500
                            rotate-180
                            scale-100
                            transition-all
                            duration-500
                        "
                    />
                ) : (
                    <Moon
                        className="
                            w-5
                            h-5
                            text-slate-600
                            dark:text-slate-300
                            scale-100
                            transition-all
                            duration-500
                        "
                    />
                )}
            </div>

            {/* Tooltip */}
            <div
                className="
                    absolute
                    -bottom-11
                    left-1/2
                    -translate-x-1/2

                    px-3
                    py-1.5

                    rounded-lg

                    bg-slate-900
                    text-white

                    text-[10px]
                    font-semibold

                    whitespace-nowrap

                    opacity-0
                    group-hover:opacity-100

                    pointer-events-none

                    transition-all
                    duration-300
                "
            >
                {darkMode
                    ? "Switch to Light Mode"
                    : "Switch to Dark Mode"}
            </div>
        </button>
    );
}

export default ThemeToggle;