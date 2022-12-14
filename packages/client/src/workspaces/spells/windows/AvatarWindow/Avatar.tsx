// i really dont like this.  But three vrm, is super grumpy/.
import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {
  VRM,
  VRMExpressionPresetName,
  VRMHumanBoneName,
  VRMLoaderPlugin,
  VRMUtils,
} from '@pixiv/three-vrm'
/*

inspired by https://twitter.com/yeemachine/status/1414993821583118341

*/

function randomsomesuch() {
  return (Math.random() - 0.5) / 10
}

const Avatar = ({ speechUrl }) => {
  const { scene, camera } = useThree()
  const gltf = useGLTF(
    `${process.env.REACT_APP_FILE_SERVER_URL}/files/VU-VRM-elf.vrm`
  )

  useEffect(() => {
    console.log('SPEECH URL', speechUrl)
  }, [speechUrl])

  // settings
  const talktime = true
  let mouththreshold = 10
  let mouthboost = 10
  let bodythreshold = 10
  let bodymotion = 10
  let expression = 80
  let expressionyay = 0
  let expressionoof = 0
  let expressionlimityay = 0.5
  let expressionlimitoof = 0.5
  let expressionease = 100
  let expressionintensity = 0.75

  let avatar

  useEffect(() => {
    if (gltf) {
      const loader = new GLTFLoader()

      loader.register(parser => {
        return new VRMLoaderPlugin(parser)
      })

      loader.load(
        `${process.env.REACT_APP_FILE_SERVER_URL}/files/VU-VRM-elf.vrm`,
        gltf => {
          const vrm = gltf.userData.vrm

          VRMUtils.removeUnnecessaryJoints(gltf.scene)
          VRMUtils.rotateVRM0(vrm)

          camera.position.set(0.0, 1.45, 0.4)
          vrm.lookAt.target = camera

          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Hips).rotation.y =
            Math.PI
          vrm.springBoneManager.reset()

          // un-T-pose
          vrm.humanoid.getRawBoneNode(
            VRMHumanBoneName.RightUpperArm
          ).rotation.z = 250

          vrm.humanoid.getRawBoneNode(
            VRMHumanBoneName.RightLowerArm
          ).rotation.z = -0.2

          vrm.humanoid.getRawBoneNode(
            VRMHumanBoneName.LeftUpperArm
          ).rotation.z = -250

          vrm.humanoid.getRawBoneNode(
            VRMHumanBoneName.LeftLowerArm
          ).rotation.z = 0.2

          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Head).rotation.x =
            randomsomesuch()
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Head).rotation.y =
            randomsomesuch()
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Head).rotation.z =
            randomsomesuch()

          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Neck).rotation.x =
            randomsomesuch()
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Neck).rotation.y =
            randomsomesuch()
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Neck).rotation.z =
            randomsomesuch()

          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Spine).rotation.x =
            randomsomesuch()
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Spine).rotation.y =
            randomsomesuch()
          vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Spine).rotation.z =
            randomsomesuch()

          vrm.springBoneManager.reset()

          function blink() {
            var blinktimeout = Math.floor(Math.random() * 250) + 50
            setTimeout(() => {
              vrm.expressionManager.setValue(
                VRMExpressionPresetName.BlinkLeft,
                0
              )
              vrm.expressionManager.setValue(
                VRMExpressionPresetName.BlinkRight,
                0
              )
            }, blinktimeout)

            vrm.expressionManager.setValue(VRMExpressionPresetName.BlinkLeft, 1)
            vrm.expressionManager.setValue(
              VRMExpressionPresetName.BlinkRight,
              1
            )
          }

          ;(function loop() {
            var rand = Math.round(Math.random() * 10000) + 1000
            setTimeout(function () {
              blink()
              loop()
            }, rand)
          })()

          avatar = vrm
        }
      )
    }
  }, [scene, gltf, camera])

  const [lastUrl, setLastUrl] = useState<string | null>(null)

  useEffect(() => {
    console.log('SPEECH URL CHANGED', speechUrl)
    if (!speechUrl) return

    const url = `${process.env.REACT_APP_FILE_SERVER_URL}/${speechUrl}`
    let interval

    // @ts-ignore
    const audioContext = new AudioContext() || new webkitAudioContext()

    const request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'
    request.onload = function () {
      audioContext.decodeAudioData(request.response, onDecoded)
    }

    function onDecoded(buffer) {
      const source = audioContext.createBufferSource()
      const analyser = audioContext.createAnalyser()

      source.buffer = buffer
      source.connect(analyser)
      analyser.connect(audioContext.destination)

      source.start()

      const array = new Uint8Array(analyser.frequencyBinCount)

      interval = setInterval(function () {
        analyser.getByteFrequencyData(array)

        var values = 0

        var length = array.length
        for (var i = 0; i < length; i++) {
          values += array[i]
        }

        // audio in expressed as one number
        var average = values / length
        var inputvolume = average

        // audio in spectrum expressed as array
        // console.log(array.toString());
        // useful for mouth shape variance

        // move the interface slider

        // mic based / endless animations (do stuff)

        if (avatar != undefined) {
          if (talktime == true) {
            // todo: more vowelshapes
            var voweldamp = 53
            var vowelmin = 12
            if (inputvolume > mouththreshold * 2) {
              avatar.expressionManager.setValue(
                VRMExpressionPresetName.Aa,
                ((average - vowelmin) / voweldamp) * (mouthboost / 10)
              )
            } else {
              avatar.expressionManager.setValue(VRMExpressionPresetName.Aa, 0)
            }
          }

          // move body

          // todo: replace with ease-to-target behaviour
          var damping = 750 / (bodymotion / 10)
          var springback = 1.001

          if (average > 1 * bodythreshold) {
            avatar.humanoid.getRawBoneNode(VRMHumanBoneName.Head).rotation.x +=
              (Math.random() - 0.5) / damping
            avatar.humanoid.getRawBoneNode(VRMHumanBoneName.Head).rotation.x /=
              springback
            avatar.humanoid.getRawBoneNode(VRMHumanBoneName.Head).rotation.y +=
              (Math.random() - 0.5) / damping
            avatar.humanoid.getRawBoneNode(VRMHumanBoneName.Head).rotation.y /=
              springback
            avatar.humanoid.getRawBoneNode(VRMHumanBoneName.Head).rotation.z +=
              (Math.random() - 0.5) / damping
            avatar.humanoid.getRawBoneNode(VRMHumanBoneName.Head).rotation.z /=
              springback

            avatar.humanoid.getRawBoneNode(VRMHumanBoneName.Neck).rotation.x +=
              (Math.random() - 0.5) / damping
            avatar.humanoid.getRawBoneNode(VRMHumanBoneName.Neck).rotation.x /=
              springback
            avatar.humanoid.getRawBoneNode(VRMHumanBoneName.Neck).rotation.y +=
              (Math.random() - 0.5) / damping
            avatar.humanoid.getRawBoneNode(VRMHumanBoneName.Neck).rotation.y /=
              springback
            avatar.humanoid.getRawBoneNode(VRMHumanBoneName.Neck).rotation.z +=
              (Math.random() - 0.5) / damping
            avatar.humanoid.getRawBoneNode(VRMHumanBoneName.Neck).rotation.z /=
              springback

            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.UpperChest
            ).rotation.x += (Math.random() - 0.5) / damping
            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.UpperChest
            ).rotation.x /= springback
            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.UpperChest
            ).rotation.y += (Math.random() - 0.5) / damping
            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.UpperChest
            ).rotation.y /= springback
            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.UpperChest
            ).rotation.z += (Math.random() - 0.5) / damping
            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.UpperChest
            ).rotation.z /= springback

            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.RightShoulder
            ).rotation.x += (Math.random() - 0.5) / damping
            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.RightShoulder
            ).rotation.x /= springback
            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.RightShoulder
            ).rotation.y += (Math.random() - 0.5) / damping
            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.RightShoulder
            ).rotation.y /= springback
            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.RightShoulder
            ).rotation.z += (Math.random() - 0.5) / damping
            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.RightShoulder
            ).rotation.z /= springback

            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.LeftShoulder
            ).rotation.x += (Math.random() - 0.5) / damping
            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.LeftShoulder
            ).rotation.x /= springback
            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.LeftShoulder
            ).rotation.y += (Math.random() - 0.5) / damping
            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.LeftShoulder
            ).rotation.y /= springback
            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.LeftShoulder
            ).rotation.z += (Math.random() - 0.5) / damping
            avatar.humanoid.getRawBoneNode(
              VRMHumanBoneName.LeftShoulder
            ).rotation.z /= springback
          }

          // yay/oof expression drift
          expressionyay += (Math.random() - 0.5) / expressionease
          if (expressionyay > expressionlimityay) {
            expressionyay = expressionlimityay
          }
          if (expressionyay < 0) {
            expressionyay = 0
          }
          avatar.expressionManager.setValue(
            VRMExpressionPresetName.Happy,
            expressionyay
          )
          expressionoof += (Math.random() - 0.5) / expressionease
          if (expressionoof > expressionlimitoof) {
            expressionoof = expressionlimitoof
          }
          if (expressionoof < 0) {
            expressionoof = 0
          }
          avatar.expressionManager.setValue(
            VRMExpressionPresetName.Angry,
            expressionoof
          )
        }
        // do something with the frequency data
      }, 10) // update the frequency data every 10 milliseconds

      source.onended = () => {
        clearInterval(interval)
        audioContext.close()
      }
    }

    request.send()

    return () => {
      if (audioContext.state !== 'closed') audioContext.close()
      clearInterval(interval)
    }
  }, [speechUrl])

  useFrame(({ clock }, delta) => {
    if (avatar) {
      avatar.update(delta)
    }
  })

  return <primitive object={gltf.scene}></primitive>
}

const AvatarFrame = ({ speechUrl }) => (
  <Canvas>
    <OrbitControls target={[0.0, 1.45, 0.0]} screenSpacePanning={true} />
    <spotLight position={[0, 2, -1]} intensity={0.4} />
    <ambientLight intensity={0.65} />
    <Avatar speechUrl={speechUrl} />
  </Canvas>
)

export default AvatarFrame
