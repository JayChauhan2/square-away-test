from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Title screen
        title = Tex("Weight Experienced by the Body", font_size=48, color=BLUE)
        self.play(Write(title))
        self.wait(2)
        self.play(FadeOut(title))

        # Step 2: Law of Floatation
        law_text = Tex("Law of Floatation:", font_size=36, color=GREEN)
        law_desc = Tex("A body floats if the weight of the liquid displaced", font_size=30, color=WHITE)
        law_desc2 = Tex("equals the total weight of the body.", font_size=30, color=WHITE)
        law_desc.next_to(law_text, DOWN)
        law_desc2.next_to(law_desc, DOWN)

        self.play(Write(law_text))
        self.wait(1)
        self.play(Write(law_desc))
        self.play(Write(law_desc2))
        self.wait(3)

        # Visual: Floating object
        circle = Circle(radius=0.5, color=YELLOW, fill_opacity=0.5)
        water = Rectangle(width=7, height=2, color=BLUE, fill_opacity=0.5)
        water.next_to(circle, DOWN, buff=0)
        self.play(FadeIn(water), FadeIn(circle))
        self.wait(2)
        self.play(FadeOut(circle), FadeOut(water), FadeOut(law_text), FadeOut(law_desc), FadeOut(law_desc2))

        # Step 3: Forces Acting on a Body
        forces_title = Tex("Forces Acting on a Body:", font_size=36, color=GREEN)
        force1 = Tex("1. Upward Thrust (Buoyancy)", font_size=30, color=WHITE)
        force1_desc = Tex("- Acts at the center of buoyancy", font_size=24, color=WHITE)
        force1_desc2 = Tex("- Magnitude = weight of liquid displaced", font_size=24, color=WHITE)
        force2 = Tex("2. Weight of the Body", font_size=30, color=WHITE)
        force2_desc = Tex("- Acts vertically downwards", font_size=24, color=WHITE)
        force2_desc2 = Tex("- Acts through its center of gravity", font_size=24, color=WHITE)

        forces_title.to_edge(UP)
        force1.next_to(forces_title, DOWN)
        force1_desc.next_to(force1, DOWN)
        force1_desc2.next_to(force1_desc, DOWN)
        force2.next_to(force1_desc2, DOWN)
        force2_desc.next_to(force2, DOWN)
        force2_desc2.next_to(force2_desc, DOWN)

        self.play(Write(forces_title))
        self.wait(1)
        self.play(Write(force1))
        self.play(Write(force1_desc))
        self.play(Write(force1_desc2))
        self.wait(1)
        self.play(Write(force2))
        self.play(Write(force2_desc))
        self.play(Write(force2_desc2))
        self.wait(3)
        self.play(FadeOut(forces_title), FadeOut(force1), FadeOut(force1_desc), FadeOut(force1_desc2), FadeOut(force2), FadeOut(force2_desc), FadeOut(force2_desc2))

        # Step 4: Visual demonstration of forces
        axes = Axes(x_range=[-2, 2], y_range=[-2, 2], axis_config={"color": WHITE})
        circle = Circle(radius=0.5, color=YELLOW, fill_opacity=0.5)
        arrow_up = Arrow(start=circle.get_center(), end=circle.get_center() + UP * 1.5, color=GREEN)
        arrow_down = Arrow(start=circle.get_center(), end=circle.get_center() + DOWN * 1.5, color=RED)
        label_up = Tex("Upward Thrust", font_size=24, color=GREEN).next_to(arrow_up, UP)
        label_down = Tex("Weight", font_size=24, color=RED).next_to(arrow_down, DOWN)

        self.play(Create(axes), FadeIn(circle))
        self.wait(1)
        self.play(GrowArrow(arrow_up), Write(label_up))
        self.play(GrowArrow(arrow_down), Write(label_down))
        self.wait(3)
        self.play(FadeOut(axes), FadeOut(circle), FadeOut(arrow_up), FadeOut(arrow_down), FadeOut(label_up), FadeOut(label_down))

        # Step 5: Conditions based on Weight (W) vs. Upward Thrust (T)
        conditions_title = Tex("Conditions Based on Weight (W) vs. Upward Thrust (T):", font_size=36, color=GREEN)
        condition1 = Tex("1. When W > T:", font_size=30, color=WHITE)
        condition1_desc = Tex("- The body will sink in the liquid.", font_size=24, color=WHITE)
        condition2 = Tex("2. When W = T:", font_size=30, color=WHITE)
        condition2_desc = Tex("- The body will remain in equilibrium.", font_size=24, color=WHITE)
        condition3 = Tex("3. When W < T:", font_size=30, color=WHITE)
        condition3_desc = Tex("- The body will float.", font_size=24, color=WHITE)
        condition3_desc2 = Tex("- Adjusts immersion to balance forces.", font_size=24, color=WHITE)

        conditions_title.to_edge(UP)
        condition1.next_to(conditions_title, DOWN)
        condition1_desc.next_to(condition1, DOWN)
        condition2.next_to(condition1_desc, DOWN)
        condition2_desc.next_to(condition2, DOWN)
        condition3.next_to(condition2_desc, DOWN)
        condition3_desc.next_to(condition3, DOWN)
        condition3_desc2.next_to(condition3_desc, DOWN)

        self.play(Write(conditions_title))
        self.wait(1)
        self.play(Write(condition1))
        self.play(Write(condition1_desc))
        self.wait(1)
        self.play(Write(condition2))
        self.play(Write(condition2_desc))
        self.wait(1)
        self.play(Write(condition3))
        self.play(Write(condition3_desc))
        self.play(Write(condition3_desc2))
        self.wait(3)
        self.play(FadeOut(conditions_title), FadeOut(condition1), FadeOut(condition1_desc), FadeOut(condition2), FadeOut(condition2_desc), FadeOut(condition3), FadeOut(condition3_desc), FadeOut(condition3_desc2))

        # Step 6: Visual examples for each condition
        # Sinking
        water = Rectangle(width=7, height=2, color=BLUE, fill_opacity=0.5)
        circle_sink = Circle(radius=0.5, color=YELLOW, fill_opacity=0.5)
        circle_sink.move_to(water.get_center() + DOWN * 1)
        self.play(FadeIn(water), FadeIn(circle_sink))
        self.wait(1)
        self.play(circle_sink.animate.move_to(water.get_center() + DOWN * 2))
        self.wait(2)
        self.play(FadeOut(water), FadeOut(circle_sink))

        # Floating
        water = Rectangle(width=7, height=2, color=BLUE, fill_opacity=0.5)
        circle_float = Circle(radius=0.5, color=YELLOW, fill_opacity=0.5)
        circle_float.move_to(water.get_top() + UP * 0.5)
        self.play(FadeIn(water), FadeIn(circle_float))
        self.wait(2)
        self.play(FadeOut(water), FadeOut(circle_float))

        # Step 7: Summary
        summary = Tex("Summary:", font_size=36, color=GREEN)
        summary_desc = Tex("The interplay between weight and buoyancy", font_size=30, color=WHITE)
        summary_desc2 = Tex("determines whether a body sinks, floats,", font_size=30, color=WHITE)
        summary_desc3 = Tex("or remains in equilibrium.", font_size=30, color=WHITE)

        summary.to_edge(UP)
        summary_desc.next_to(summary, DOWN)
        summary_desc2.next_to(summary_desc, DOWN)
        summary_desc3.next_to(summary_desc2, DOWN)

        self.play(Write(summary))
        self.wait(1)
        self.play(Write(summary_desc))
        self.play(Write(summary_desc2))
        self.play(Write(summary_desc3))
        self.wait(3)
        self.play(FadeOut(summary), FadeOut(summary_desc), FadeOut(summary_desc2), FadeOut(summary_desc3))

        self.wait(1)