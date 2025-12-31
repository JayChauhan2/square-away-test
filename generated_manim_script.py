from manim import *

class Explainer(Scene):
    def construct(self):
        # Step 1: Display the title
        title = Tex("True/False: When counting by 5s,", "\\\\", "the number 15 comes after 10.")
        title.set_color_by_tex("True/False", YELLOW)
        self.play(Write(title))
        self.wait(1)

        # Step 2: Show number line with multiples of 5
        self.play(FadeOut(title))
        number_line = NumberLine(
            x_range=[0, 20, 5],
            length=10,
            color=BLUE,
            include_numbers=True,
            label_direction=UP,
        )
        number_line.add_numbers(*range(0, 21, 5))
        self.play(Create(number_line))
        self.wait(1)

        # Step 3: Highlight 10 and 15
        dot_10 = Dot(number_line.n2p(10), color=RED)
        dot_15 = Dot(number_line.n2p(15), color=GREEN)
        label_10 = Tex("10").next_to(dot_10, UP)
        label_15 = Tex("15").next_to(dot_15, UP)
        self.play(
            FadeIn(dot_10),
            FadeIn(dot_15),
            Write(label_10),
            Write(label_15)
        )
        self.wait(1)

        # Step 4: Show arrow from 10 to 15
        arrow = Arrow(
            dot_10.get_center(),
            dot_15.get_center(),
            buff=0.1,
            color=YELLOW
        )
        self.play(GrowArrow(arrow))
        self.wait(1)

        # Step 5: Display answer
        answer = Tex("True", color=GREEN).scale(1.5)
        checkmark = Tex("✓", color=GREEN).next_to(answer, RIGHT)
        self.play(
            FadeOut(number_line),
            FadeOut(dot_10),
            FadeOut(dot_15),
            FadeOut(label_10),
            FadeOut(label_15),
            FadeOut(arrow),
            Write(answer),
            Write(checkmark)
        )
        self.wait(1)

        # Step 6: Show explanation
        explanation = Tex(
            "When counting by 5s:",
            "5, 10, 15, 20...",
            "\\\\",
            "15 does come after 10"
        )
        explanation[1].set_color(BLUE)
        explanation[3].set_color(GREEN)
        self.play(
            Transform(answer, explanation)
        )
        self.wait(2)

        self.wait(1)  # Total duration placeholder