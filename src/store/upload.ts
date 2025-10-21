import { StateCreator } from "zustand";

const createUploadSlice: StateCreator<
  appStoreType,
  mutationType,
  [],
  UploadStore
> = (set) => ({
  jobs: [],
  addJob: (job) => {
    const id = crypto.randomUUID();
    set((state) => ({
      jobs: [
        ...state.jobs,
        { ...job, id: job?.id ?? id, status: "pending", progress: 0 },
      ],
    }));
    return job?.id ?? id;
  },
  updateJob: (id, data) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...data } : j)),
    })),
  removeJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
    })),
});

export default createUploadSlice;
