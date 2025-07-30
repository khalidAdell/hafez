"use client";
import React, { useRef } from "react";
import Image from "next/image";
import Slider from "react-slick";
import { IoMdArrowRoundForward, IoMdArrowRoundBack } from "react-icons/io";
import { Fade, Slide } from "react-awesome-reveal";

const Banner = ({ sliders }) => {
  const sliderRef = useRef(null);

  if (!sliders || sliders.length === 0) return null;

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    rtl: true,
  };

  return (
    <section className="relative w-full z-10">
      <button
        onClick={() => sliderRef.current?.slickNext()}
        className="absolute max-sm:hidden right-4 top-1/2 z-50 text-white text-4xl bg-black/40 p-2 rounded-full hover:bg-black transition-all"
      >
        <IoMdArrowRoundForward />
      </button>
      <button
        onClick={() => sliderRef.current?.slickPrev()}
        className="absolute max-sm:hidden left-4 top-1/2 z-50 text-white text-4xl bg-black/40 p-2 rounded-full hover:bg-black transition-all"
      >
        <IoMdArrowRoundBack />
      </button>

      <Slider
        ref={sliderRef}
        {...sliderSettings}
        className="main-slider w-full h-full"
      >
        {sliders.map(({ image_url, title, content }, index) => (
          <div key={index}>
            <div className="carousel-item relative min-h-screen bg-transparent">
              <div className="carousel-img absolute inset-0 z-0">
                <Image
                  src={image_url}
                  alt={`Slide ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div
                  className="absolute inset-0 z-10"
                  style={{
                    background:
                      "linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1)), linear-gradient(-103.1deg, rgba(11,116,89,0.9) -2.23%, rgba(0,0,0,0.9) 56.5%, rgb(0,0,0) 101.31%)",
                  }}
                ></div>
              </div>

              <div className="carousel-content absolute top-0 left-0 w-full h-full flex items-center justify-center z-20">
                <div className="text text-center px-4">
                  <div suppressHydrationWarning>
                    <Slide
                      direction="down"
                      delay={300}
                      duration={800}
                      triggerOnce
                    >
                      <h1 className="text-4xl sm:text-5xl text-white font-bold">
                        {title}
                      </h1>
                    </Slide>
                  </div>

                  <Fade delay={800} duration={1000} triggerOnce>
                    <p className="text-white mt-4 text-base sm:text-lg">
                      {content}
                    </p>
                  </Fade>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default Banner;
