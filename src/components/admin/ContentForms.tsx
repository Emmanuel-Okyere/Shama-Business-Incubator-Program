"use client";

import { Collapsible, DeleteButton, EditorForm } from "@/components/admin/Editor";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { submitted, wasChecked } from "@/lib/form-values";
import {
  createTeamMember,
  deleteEvent,
  deletePartner,
  deletePost,
  saveEvent,
  savePartner,
  savePost,
} from "@/lib/actions/content";

const STATUSES: [string, string][] = [
  ["PUBLISHED", "Published"],
  ["DRAFT", "Draft"],
  ["SCHEDULED", "Scheduled"],
  ["ARCHIVED", "Archived"],
];

export function NewPost() {
  return (
    <Collapsible
      title="News & updates"
      subtitle="Announcements, success stories, programme updates and press releases"
      openLabel="Write a post"
    >
      <EditorForm action={savePost} submitLabel="Publish post">
        {(state) => (
          <>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Title" required error={state.errors?.title} className="sm:col-span-2">
                <Input name="title" defaultValue={submitted(state.values, "title")} placeholder="Applications open for Cohort 2" />
              </Field>
              <Field label="Category" required>
                <Select
              key={submitted(state.values, "category", "Announcement")}
              name="category"
              defaultValue={submitted(state.values, "category", "Announcement")}
            >
                  {["Announcement", "News", "Success story", "Programme update", "Press release", "Event recap", "Guidance"].map(
                    (c) => (
                      <option key={c}>{c}</option>
                    ),
                  )}
                </Select>
              </Field>
            </div>

            <Field label="Summary" required hint="Shown on cards and in search results" error={state.errors?.excerpt}>
              <Textarea name="excerpt" rows={2} defaultValue={submitted(state.values, "excerpt")} />
            </Field>

            <Field label="Body" required hint="Leave a blank line between paragraphs" error={state.errors?.body}>
              <Textarea name="body" rows={10} defaultValue={submitted(state.values, "body")} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Author" required>
                <Input name="author" defaultValue={submitted(state.values, "author", "Programme Team")} />
              </Field>
              <Field label="Status" required>
                <Select
              key={submitted(state.values, "status", "PUBLISHED")}
              name="status"
              defaultValue={submitted(state.values, "status", "PUBLISHED")}
            >
                  {STATUSES.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Publish date" error={state.errors?.publishedAt}>
                <Input name="publishedAt" type="date" defaultValue={submitted(state.values, "publishedAt")} />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="URL slug" hint="Left blank, it is made from the title">
                <Input name="slug" defaultValue={submitted(state.values, "slug")} placeholder="applications-open-cohort-2" />
              </Field>
              <Field label="Cover image URL" hint="A path under /brand or a full URL">
                <Input name="coverUrl" defaultValue={submitted(state.values, "coverUrl")} placeholder="/brand/photo-bootcamp.webp" />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="SEO title">
                <Input name="seoTitle" defaultValue={submitted(state.values, "seoTitle")} />
              </Field>
              <Field label="SEO description">
                <Input name="seoDesc" defaultValue={submitted(state.values, "seoDesc")} />
              </Field>
            </div>
          </>
        )}
      </EditorForm>
    </Collapsible>
  );
}

export function DeletePost({ id }: { id: string }) {
  return <DeleteButton confirm="Delete this post?" onDelete={() => deletePost(id)} />;
}

export function NewEvent() {
  return (
    <Collapsible
      title="Events"
      subtitle="Information sessions, bootcamp sessions, pitch competitions, graduation and Growth Labs"
      openLabel="Add event"
    >
      <EditorForm action={saveEvent} submitLabel="Publish event">
        {(state) => (
          <>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Title" required error={state.errors?.title} className="sm:col-span-2">
                <Input name="title" defaultValue={submitted(state.values, "title")} placeholder="Information Session — Shama Junction" />
              </Field>
              <Field label="Event type" required>
                <Select
              key={submitted(state.values, "kind", "Information Session")}
              name="kind"
              defaultValue={submitted(state.values, "kind", "Information Session")}
            >
                  {["Information Session", "Bootcamp Session", "Workshop", "Pitch Competition", "Graduation", "Business Showcase", "Networking", "Growth Lab", "Annual Cohort Exit"].map(
                    (k) => (
                      <option key={k}>{k}</option>
                    ),
                  )}
                </Select>
              </Field>
            </div>

            <Field label="Description" required error={state.errors?.description}>
              <Textarea name="description" rows={3} defaultValue={submitted(state.values, "description")} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Starts" required error={state.errors?.startsAt}>
                <Input name="startsAt" type="datetime-local" defaultValue={submitted(state.values, "startsAt")} />
              </Field>
              <Field label="Ends" error={state.errors?.endsAt}>
                <Input name="endsAt" type="datetime-local" defaultValue={submitted(state.values, "endsAt")} />
              </Field>
              <Field label="Location" required error={state.errors?.location}>
                <Input name="location" defaultValue={submitted(state.values, "location")} placeholder="Shama District Assembly Hall" />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Programme stage">
                <Input name="stage" defaultValue={submitted(state.values, "stage")} placeholder="Application" />
              </Field>
              <Field label="Registration link">
                <Input name="registerUrl" defaultValue={submitted(state.values, "registerUrl")} placeholder="https://…" />
              </Field>
              <Field label="Status" required>
                <Select
              key={submitted(state.values, "status", "PUBLISHED")}
              name="status"
              defaultValue={submitted(state.values, "status", "PUBLISHED")}
            >
                  {STATUSES.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="URL slug" hint="Left blank, it is made from the title">
              <Input name="slug" defaultValue={submitted(state.values, "slug")} />
            </Field>
          </>
        )}
      </EditorForm>
    </Collapsible>
  );
}

export function DeleteEvent({ id }: { id: string }) {
  return <DeleteButton confirm="Delete this event?" onDelete={() => deleteEvent(id)} />;
}

export function NewPartner() {
  return (
    <Collapsible
      title="Partners & sponsors"
      subtitle="Named on the homepage and the partners page"
      openLabel="Add partner"
    >
      <EditorForm action={savePartner} submitLabel="Add partner">
        {(state) => (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Organisation" required error={state.errors?.name}>
                <Input name="name" defaultValue={submitted(state.values, "name")} placeholder="Shama District Assembly" />
              </Field>
              <Field label="Tier">
                <Select
              key={submitted(state.values, "tier")}
              name="tier"
              defaultValue={submitted(state.values, "tier")}
            >
                  <option value="">Not set</option>
                  {["Supporter", "Growth Partner", "Strategic Partner", "Title Sponsor", "Institutional", "Community"].map(
                    (t) => (
                      <option key={t}>{t}</option>
                    ),
                  )}
                </Select>
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Website">
                <Input name="website" defaultValue={submitted(state.values, "website")} placeholder="https://…" />
              </Field>
              <Field label="Logo URL">
                <Input name="logoUrl" defaultValue={submitted(state.values, "logoUrl")} placeholder="/brand/…" />
              </Field>
              <Field label="Display order" required error={state.errors?.order}>
                <Input name="order" type="number" min={0} defaultValue={submitted(state.values, "order", 0)} />
              </Field>
            </div>

            <div className="rounded-2xl bg-lime-50 p-5">
              <Checkbox
              key={String(wasChecked(state.values, "featured"))} name="featured" defaultChecked={wasChecked(state.values, "featured")} label="Feature this partner prominently" />
            </div>
          </>
        )}
      </EditorForm>
    </Collapsible>
  );
}

export function DeletePartner({ id }: { id: string }) {
  return <DeleteButton label="Remove" confirm="Remove this partner?" onDelete={() => deletePartner(id)} />;
}

export function NewTeamMember() {
  return (
    <Collapsible
      title="Create an account"
      subtitle="Administrators, facilitators, judges and mentors"
      openLabel="New account"
    >
      <EditorForm action={createTeamMember} submitLabel="Create account">
        {(state) => (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" required error={state.errors?.fullName}>
                <Input name="fullName" defaultValue={submitted(state.values, "fullName")} autoComplete="off" />
              </Field>
              <Field label="Email address" required error={state.errors?.email}>
                <Input name="email" type="email" defaultValue={submitted(state.values, "email")} autoComplete="off" />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Phone number">
                <Input name="phone" type="tel" defaultValue={submitted(state.values, "phone")} placeholder="024 123 4567" />
              </Field>
              <Field label="Role" required>
                <Select
              key={submitted(state.values, "role", "ADMIN")}
              name="role"
              defaultValue={submitted(state.values, "role", "ADMIN")}
            >
                  {[
                    ["ADMIN", "Programme administrator"],
                    ["SUPER_ADMIN", "Super administrator"],
                    ["FACILITATOR", "Facilitator"],
                    ["JUDGE", "Judge"],
                    ["MENTOR", "Mentor"],
                  ].map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Temporary password"
                required
                hint="At least 8 characters"
                error={state.errors?.password}
              >
                <Input name="password" type="text" autoComplete="off" />
              </Field>
            </div>

            <p className="text-[0.82rem] leading-relaxed text-ink-500">
              Share the password with them directly rather than by email, and ask them to change it
              once they are in.
            </p>
          </>
        )}
      </EditorForm>
    </Collapsible>
  );
}
