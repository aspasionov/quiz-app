'use client'

import { Control, Controller, FieldErrors } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Autocomplete,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

export interface QuizInfoFormData {
  title: string;
  description: string;
  category: string;
  visibility: 'public' | 'private';
  tags: string[];
}

interface GeneralStepProps {
  control: Control<QuizInfoFormData>;
  errors: FieldErrors<QuizInfoFormData>;
  watchedValues: QuizInfoFormData;
  availableTags: string[];
  isLoadingTags: boolean;
}

export const GeneralStep = ({
  control,
  errors,
  watchedValues,
  availableTags,
  isLoadingTags
}: GeneralStepProps) => {
  return (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Quiz Information
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label="Quiz Title"
                required
                placeholder="Enter an engaging title for your quiz"
                error={!!fieldState.error}
                helperText={fieldState.error?.message || `${field.value?.length || 0}/256 characters`}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label="Description"
                multiline
                rows={4}
                placeholder="Describe what this quiz covers and what learners will gain"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            )}
          />

          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 6 }}>
            <Controller
            name="tags"
            control={control}
            render={({ field, fieldState }) => (
              <Autocomplete
                {...field}
                multiple
                freeSolo
                size="small"
                options={availableTags}
                value={field.value || []}
                loading={isLoadingTags}
                onChange={(event, value) => {
                  const newTags = value.map(tag => 
                    typeof tag === 'string' && tag.startsWith('Create "') 
                      ? tag.slice(8, -1) // Remove 'Create "' and '"'
                      : tag
                  ).filter(tag => typeof tag === 'string' && tag.trim() !== '');
                  field.onChange(newTags);
                }}
                filterOptions={(options, params) => {
                  const filtered = options.filter(option =>
                    option.toLowerCase().includes(params.inputValue.toLowerCase())
                  );
                  
                  const { inputValue } = params;
                  // Suggest the creation of a new value
                  const isExisting = options.some(option => 
                    inputValue.toLowerCase() === option.toLowerCase()
                  );
                  
                  if (inputValue !== '' && !isExisting) {
                    filtered.push(`Create "${inputValue}"`);
                  }
                  
                  return filtered;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder={isLoadingTags ? "Loading tags..." : "Type to search or create tags..."}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message || 'Add at least 1 tag to describe your quiz'}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2 }
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="filled"
                      label={option}
                      size="small"
                      color="primary"
                      {...getTagProps({ index })}
                      key={index}
                      sx={{ borderRadius: 1 }}
                    />
                  ))
                }
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box component="li" key={key} {...otherProps}>
                      {option.startsWith('Create "') ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AddIcon sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
                          {option}
                        </Box>
                      ) : (
                        <Chip
                          label={option}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                      )}
                    </Box>
                  );
                }}
                ChipProps={{
                  size: 'small',
                  variant: 'filled',
                  color: 'primary'
                }}
              />
            )}
          />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="visibility"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel id="visibility-label">Visibility</InputLabel>
                    <Select
                      {...field}
                      labelId="visibility-label"
                      label="Visibility"
                      size="small"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="public">🌐 Public - Anyone can take</MenuItem>
                      <MenuItem value="private">🔒 Private - Only you</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
