import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Save, Trash } from "lucide-react";
import axios from "axios";

interface Note {
  _id: string;
  title: string;
  noteInSecond: number;
  lectureId: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function NotesPage() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState({
    title: "",
    noteInSecond: 0,
    lectureId: lectureId || "",
  });
  const [currentTime, setCurrentTime] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    if (lectureId) {
      fetchNotes();
    }
  }, [lectureId]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/v1/notes?lectureId=${lectureId}`);
      setNotes(response.data.data.notes || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      if (!newNote.title.trim()) {
        toast({
          title: "Error",
          description: "Please enter a title for your note",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.post("/api/v1/notes", {
        ...newNote,
        noteInSecond: currentTime || 0,
        lectureId,
      });

      setNotes((prev) => [...prev, response.data.data.note]);
      setNewNote({ title: "", noteInSecond: 0, lectureId: lectureId || "" });

      toast({
        title: "Success",
        description: "Note created successfully",
      });
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await axios.delete(`/api/v1/notes/${noteId}`);
      setNotes((prev) => prev.filter((note) => note._id !== noteId));
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Lecture Notes</h1>

      <Tabs defaultValue="my-notes" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="my-notes">My Notes</TabsTrigger>
          <TabsTrigger value="add-note">Add Note</TabsTrigger>
        </TabsList>

        <TabsContent value="my-notes">
          {isLoading ? (
            <div className="flex justify-center py-8">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">You haven't created any notes yet.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  const addNoteTab = document.querySelector('[data-value="add-note"]');
                  if (addNoteTab instanceof HTMLElement) {
                    addNoteTab.click();
                  }
                }}
              >
                Create Your First Note
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className="bg-white p-4 rounded-lg shadow border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{note.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Timestamp: {formatTime(note.noteInSecond)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note._id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Created {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add-note">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <div className="mb-4">
              <label htmlFor="note-title" className="block text-sm font-medium mb-1">
                Note Title
              </label>
              <Input
                id="note-title"
                placeholder="Enter a title for your note"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="timestamp" className="block text-sm font-medium mb-1">
                Timestamp
              </label>
              <div className="flex items-center">
                <Input
                  id="timestamp"
                  placeholder="Video timestamp"
                  value={formatTime(currentTime)}
                  readOnly
                  className="bg-gray-50"
                />
                <Button
                  variant="outline"
                  className="ml-2"
                  onClick={() => setCurrentTime(currentTime)}
                  title="Use current video time"
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This will be automatically set to the current video time
              </p>
            </div>

            <Button onClick={handleCreateNote} className="mt-2">
              <Save className="h-4 w-4 mr-2" />
              Save Note
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
