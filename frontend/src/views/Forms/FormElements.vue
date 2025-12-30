<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <!-- <div class="grid grid-cols-1 gap-6 sm:grid-cols-2"> -->
      <div class=" w-full">
        <ComponentCard title="Reusable Form Component">
          <Form 
            :fields="demoFormFields"
            :initial-data="demoFormData"
            submit-button-text="Save Changes"
            show-reset-button
            @submit="handleFormSubmit"
            @reset="handleFormReset"
          />
        </ComponentCard>
      <!-- </div> -->
    
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import Form from '@/components/forms/Form.vue'
import type { FormFieldConfig } from '@/components/forms/Form.vue'

const currentPageTitle = ref('Form Elements')

// Demo form fields configuration
const demoFormFields: FormFieldConfig[] = [
  {
    key: 'firstName',
    type: 'text',
    label: 'First Name',
    placeholder: 'Enter your first name',
    required: true,
    validation: {
      minLength: 2,
      maxLength: 50
    }
  },
  {
    key: 'lastName',
    type: 'text',
    label: 'Last Name',
    placeholder: 'Enter your last name',
    required: true,
    validation: {
      minLength: 2,
      maxLength: 50
    }
  },
  {
    key: 'email',
    type: 'email',
    label: 'Email Address',
    placeholder: 'Enter your email',
    required: true,
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  },
  {
    key: 'phone',
    type: 'tel',
    label: 'Phone Number',
    placeholder: '+1 (555) 123-4567',
    validation: {
      pattern: /^[\+]?[1-9][\d]{0,15}$/
    }
  },
  {
    key: 'age',
    type: 'number',
    label: 'Age',
    placeholder: 'Enter your age',
    min: 18,
    max: 120,
    validation: {
      min: 18,
      max: 120
    }
  },
  {
    key: 'country',
    type: 'select',
    label: 'Country',
    placeholder: 'Select your country',
    required: true,
    options: [
      { label: 'United States', value: 'US' },
      { label: 'Canada', value: 'CA' },
      { label: 'United Kingdom', value: 'UK' },
      { label: 'Australia', value: 'AU' },
      { label: 'Germany', value: 'DE' },
      { label: 'France', value: 'FR' }
    ]
  },
  {
    key: 'bio',
    type: 'textarea',
    label: 'Biography',
    placeholder: 'Tell us about yourself...',
    rows: 4,
    validation: {
      maxLength: 500
    }
  },
  {
    key: 'subscribe',
    type: 'switch',
    label: 'Subscribe to newsletter'
  },
  {
    key: 'experience',
    type: 'radio',
    label: 'Experience Level',
    required: true,
    options: [
      { label: 'Beginner', value: 'beginner' },
      { label: 'Intermediate', value: 'intermediate' },
      { label: 'Advanced', value: 'advanced' },
      { label: 'Expert', value: 'expert' }
    ]
  },
  {
    key: 'skills',
    type: 'group',
    label: 'Skills & Preferences',
    description: 'Tell us about your technical skills',
    groupClass: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    fields: [
      {
        key: 'programmingLanguages',
        type: 'select',
        label: 'Primary Language',
        placeholder: 'Select your main language',
        options: [
          { label: 'JavaScript', value: 'javascript' },
          { label: 'Python', value: 'python' },
          { label: 'Java', value: 'java' },
          { label: 'C#', value: 'csharp' },
          { label: 'PHP', value: 'php' },
          { label: 'Ruby', value: 'ruby' }
        ]
      },
      {
        key: 'yearsExperience',
        type: 'number',
        label: 'Years of Experience',
        placeholder: 'Years',
        min: 0,
        max: 50
      },
      {
        key: 'remoteWork',
        type: 'checkbox',
        label: 'Open to remote work'
      },
      {
        key: 'availability',
        type: 'select',
        label: 'Availability',
        placeholder: 'Select availability',
        options: [
          { label: 'Full-time', value: 'fulltime' },
          { label: 'Part-time', value: 'parttime' },
          { label: 'Contract', value: 'contract' },
          { label: 'Freelance', value: 'freelance' }
        ]
      }
    ]
  }
]

// Demo form initial data
const demoFormData = ref({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  subscribe: true,
  experience: 'intermediate',
  remoteWork: true
})

// Form event handlers
const handleFormSubmit = (data: Record<string, any>) => {
  console.log('Form submitted with data:', data)
  alert('Form submitted successfully! Check console for data.')
}

const handleFormReset = () => {
  console.log('Form reset')
}
</script>
