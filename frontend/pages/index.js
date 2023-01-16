import React, { useState } from "react";
import Alert from "../components/Alert";
import Link from "next/link";
import Footer from "../components/Footer";
import Head from "next/head";
import Image from "next/image";
import axios from "axios";
import { getPlaiceholder } from "plaiceholder";
import svg from 'svg-builder'

const album_count = 15; // Number of albums to display

export async function getServerSideProps() {
  const response = await axios.get(process.env.REACT_APP_API_URL);
  const albums = response.data.albums.slice(0, album_count);
  const imagePaths = [];
  albums.map((album) => imagePaths.push(album.cover));

  const images = await Promise.all(
    imagePaths.map(async (src) => {
      const { base64, img } = await getPlaiceholder(src);

      return {
        ...img,
        blurDataURL: base64,
      };
    })
  );

  return {
    props: { albums, images },
  };
}

export default function Home({ albums, images }) {
  const [alert, setAlert] = useState(false);

  const copyColor = (e) => {
    navigator.clipboard.writeText(e.target.title);
    setAlert(true);
    setTimeout(() => {
      setAlert(false);
    }, 2000);
  };

  const downloadSVG = (album) => {
    let svgBuilder = svg.newInstance();
    svgBuilder.width('').height('')
    svgBuilder.viewBox('0 0 400 250')
    svgBuilder.g({}, svgBuilder.rect({
      x: 0,
      y: 0,
      width: "50",
      height: "220",
      fill: album.palette[0]
    }), svgBuilder.rect({
      x: 50,
      y: 0,
      width: "50",
      height: "220",
      fill: album.palette[1]
    }), svgBuilder.rect({
      x: 100,
      y: 0,
      width: "50",
      height: "220",
      fill: album.palette[2]
    }), svgBuilder.rect({
      x: 150,
      y: 0,
      width: "50",
      height: "220",
      fill: album.palette[3]
    }), svgBuilder.rect({
      x: 200,
      y: 0,
      width: "50",
      height: "220",
      fill: album.palette[4]
    }), svgBuilder.rect({
      x: 250,
      y: 0,
      width: "50",
      height: "220",
      fill: album.palette[5]
    }), svgBuilder.rect({
      x: 300,
      y: 0,
      width: "50",
      height: "220",
      fill: album.palette[6]
    }), svgBuilder.rect({
      x: 350,
      y: 0,
      width: "50",
      height: "220",
      fill: album.palette[7]
    }), svgBuilder.text({
      x: "10",
      y: "235",
      'font-family': 'Arial',
      'font-size': '6',
      'alignment-baseline': 'middle'
    }, 'Exported from color-fy'), svgBuilder.text({
      x: "390",
      y: "235",
      'font-family': 'Arial',
      'font-size': '6',
      'alignment-baseline': 'middle',
      'text-anchor': 'end'
    }, `${album.name} by ${album.artist}`)).render();

    let svgData = `${svgBuilder.root}${svgBuilder.elements[0]}${svgBuilder.elements[1]}${svgBuilder.elements[2]}</svg>`
    let svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    let svgUrl = URL.createObjectURL(svgBlob);
    let downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `${album.name} - ${album.artist}`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  return (
    <React.Fragment>
      <Head>
        <title>color-fy</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💥</text></svg>"
        ></link>
      </Head>
      <div className="mx-2 md:mx-4 pb-4">
        <Link href="/" passHref>
          <h1 className="font-black text-7xl md:text-brand py-5 md:pb-14 tracking-widest text-center cursor-pointer select-none">
            color-fy
          </h1>
        </Link>
        <h1 className="text-4xl md:text-6xl uppercase bg-black text-white font-black px-2 py-4 tracking-widest text-center select-none">
          <span>New Releases Of This Week</span>
        </h1>
        <div
          className="font-inter grid md:grid-cols-3"
          style={{ background: "#E5E5F7" }}
        >
          {albums.map((album, i) => (
            <div
              className={`p-4  ${[1, 4, 7, 10, 13].includes(i)
                ? "border-x-8 md:border-x-0"
                : "border-x-8"
                } border-y-4 border-black`}
              key={album._id}
            >
              <a href={album.url} target="_blank" rel="noreferrer">
                <Image
                  {...images[i]}
                  alt=""
                  className="cursor-pointer"
                  height={640}
                  width={640}
                  quality={100}
                  loading="lazy"
                  placeholder="blur"
                />
              </a>
              <div className="flex pt-4 justify-between items-center">
                <div>
                  <p className=" font-black text-2xl uppercase ">
                    {album.name}
                  </p>
                  <p className=" font-black text-xl uppercase">{album.artist}</p>
                </div>
                <div className="cursor-pointer ml-5" onClick={e => downloadSVG(album)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 py-4 gap-y-3 gap-x-3">
                {album.palette.map((color, i) => (
                  <div
                    className="flex flex-col cursor-pointer hover:opacity-75 col-span-1"
                    key={i}
                    onClick={copyColor}
                    title={color}
                  >
                    <span
                      className="uppercase text-center text-gray-light font-black bg-black py-1"
                      title={color}
                    >
                      {color}
                    </span>
                    <p
                      className="h-14"
                      style={{ backgroundColor: `${color}` }}
                      title={color}
                    ></p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Footer />
        <Alert alert={alert} />
      </div>
    </React.Fragment>
  );
}
