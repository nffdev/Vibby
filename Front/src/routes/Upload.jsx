import useSWR from 'swr';
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import BottomNav from "@/components/nav/BottomNav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload } from 'lucide-react'
import { BASE_API, API_VERSION } from "../config.json"
import MuxUploader from "@mux/mux-uploader-react";

export default function UploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const fetcher = (url) => fetch(`${BASE_API}/v${API_VERSION}${url}`, { method: 'POST', headers: { 'Authorization': localStorage.getItem('token') } }).then(response => response.json());
  const { data, isLoading } = useSWR('/uploads', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'video/*',
    multiple: false
  })

  const manageSubmit = (e) => {
    e.preventDefault()
    console.log('Uploading:', { file, title, description })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-900 to-sky-400 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold text-center text-gray-900">Upload Video</h1>
            <div className="w-6"></div> 
          </div>

          <form onSubmit={manageSubmit} className="space-y-6">
            {/* <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <p className="text-sm text-gray-600">File selected: {file.name}</p>
              ) : (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-1 text-sm text-gray-600">
                    Drag n drop a video here, or click to select a file
                  </p>
                </div>
              )}
            </div> */}

            <MuxUploader endpoint={data?.url || ''}/>

            <Input
              type="text"
              placeholder="Video Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />

            <Textarea
              placeholder="Video Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full"
            />

            <Button type="submit" className="w-full">
              Upload Video
            </Button>
          </form>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

