from manim import *

class Explainer(Scene):
    def construct(self):
        # Step 1: Introduction
        question = Tex("What is the next number when counting by 2s: 2, 4, 6, \\underline{\\hspace{1cm}}?", font_size=36)
        self.play(Write(question))
        self.wait(2)

        # Step 2: Visual Counting
        self.clear()
        number_line = NumberLine(x_range=[0, 10, 1], length=8, color=BLUE)
        numbers = VGroup(*[Tex(str(i), color=GREEN).next_to(number_line.n2p(i), DOWN) for i in range(0, 11, 2)])
        blank = Rectangle(height=0.5, width=1, color=WHITE, fill_opacity=1).next_to(number_line.n2p(6), DOWN)

        self.play(Create(number_line))
        self.play(FadeIn(numbers[:3]))  # Show 2, 4, 6
        self.play(FadeIn(blank))  # Show blank space
        self.wait(2)

        # Step 3: Pattern Explanation
        arrows = VGroup(
            Arrow(number_line.n2p(2), number_line.n2p(4), color=YELLOW),
            Arrow(number_line.n2p(4), number_line.n2p(6), color=YELLOW),
            Arrow(number_line.n2p(6), number_line.n2p(8), color=YELLOW, stroke_opacity=0.5)
        )
        pattern_text = Tex("+2", color=RED).next_to(arrows[0], UP)

        self.play(Create(arrows[0]), Write(pattern_text))
        self.wait(1)
        self.play(Transform(arrows[0].copy(), arrows[1]), pattern_text.animate.next_to(arrows[1], UP))
        self.wait(1)
        self.play(Transform(arrows[1].copy(), arrows[2]), pattern_text.animate.next_to(arrows[2], UP))
        self.wait(2)

        # Step 4: Solution Reveal
        solution = Tex("8", color=GREEN).move_to(blank)
        self.play(Transform(blank, solution))
        self.wait(2)

        # Step 5: Summary
        self.clear()
        summary = VGroup(
            Tex("Counting by 2s:", font_size=36),
            Tex("2, 4, 6, 8, ...", color=BLUE, font_size=36).next_to(DOWN, buff=0.5),
            Tex("The next number is 8!", color=GREEN, font_size=36).next_to(DOWN, buff=1)
        )
        self.play(Write(summary[0]))
        self.wait(1)
        self.play(Write(summary[1]))
        self.wait(1)
        self.play(Write(summary[2]))
        self.wait(2)

        self.wait(1)  # Total duration placeholder