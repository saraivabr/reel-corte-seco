// Recorte da pessoa quadro a quadro (Apple Vision) -> máscara 960x540 em cinza, crua, no stdout.
// Uso: matte <video.mp4> [balanced|accurate] [W H] | ffmpeg -f rawvideo -pix_fmt gray -s 960x540 -r 30 -i - ...
import AVFoundation
import CoreImage
import Foundation
import Vision

let args = CommandLine.arguments
let url = URL(fileURLWithPath: args[1])
let quality: VNGeneratePersonSegmentationRequest.QualityLevel = (args.count > 2 && args[2] == "accurate") ? .accurate : .balanced
// tamanho da máscara: argumentos 3 e 4 (padrão 960x540; Reels: 540x960)
let OW = args.count > 4 ? Int(args[3])! : 960, OH = args.count > 4 ? Int(args[4])! : 540

let asset = AVURLAsset(url: url)
let track = asset.tracks(withMediaType: .video)[0]
let reader = try! AVAssetReader(asset: asset)
let out = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
out.alwaysCopiesSampleData = false
reader.add(out)
reader.startReading()

let req = VNGeneratePersonSegmentationRequest()
req.qualityLevel = quality
req.outputPixelFormat = kCVPixelFormatType_OneComponent8
let seq = VNSequenceRequestHandler()  // suaviza entre quadros
let ctx = CIContext(options: [.workingColorSpace: NSNull()])
var buf = [UInt8](repeating: 0, count: OW * OH)
let stdout = FileHandle.standardOutput
var n = 0
while let sample = out.copyNextSampleBuffer(), let px = CMSampleBufferGetImageBuffer(sample) {
    autoreleasepool {
        try? seq.perform([req], on: px)
        if let m = req.results?.first?.pixelBuffer {
            var ci = CIImage(cvPixelBuffer: m)
            ci = ci.transformed(by: CGAffineTransform(scaleX: CGFloat(OW) / ci.extent.width, y: CGFloat(OH) / ci.extent.height))
            ctx.render(ci, toBitmap: &buf, rowBytes: OW, bounds: CGRect(x: 0, y: 0, width: OW, height: OH),
                       format: .L8, colorSpace: nil)
        }
        stdout.write(Data(buf))
        n += 1
        if n % 900 == 0 { FileHandle.standardError.write("matte \(n)\n".data(using: .utf8)!) }
    }
}
