const { withAppBuildGradle } = require("@expo/config-plugins");

const PATCH_START = "// >>> mpv libc++ runtime";
const PATCH_END = "// <<< mpv libc++ runtime";

const PATCH = `${PATCH_START}
def mpvLibcxxAar = configurations.detachedConfiguration(
    dependencies.create("dev.jdtech.mpv:libmpv:1.0.0@aar")
)
mpvLibcxxAar.transitive = false

androidComponents {
    onVariants(selector().all()) { variant ->
        def capitalizedVariantName = variant.name.capitalize()
        def mergedNativeLibsDir = layout.buildDirectory.dir(
            "intermediates/merged_native_libs/\${variant.name}/merge\${capitalizedVariantName}NativeLibs/out/lib"
        )

        def syncMpvLibcxx = tasks.register("sync\${capitalizedVariantName}MpvLibcxx") {
            dependsOn("merge\${capitalizedVariantName}NativeLibs")
            inputs.files(mpvLibcxxAar)

            doLast {
                copy {
                    from(zipTree(mpvLibcxxAar.singleFile)) {
                        include "jni/**/libc++_shared.so"
                        eachFile { fileCopyDetails ->
                            fileCopyDetails.relativePath = new RelativePath(
                                true,
                                fileCopyDetails.relativePath.segments.drop(1)
                            )
                        }
                        includeEmptyDirs = false
                    }
                    into mergedNativeLibsDir
                }
            }
        }

        tasks.matching { it.name == "strip\${capitalizedVariantName}DebugSymbols" }.configureEach {
            dependsOn(syncMpvLibcxx)
        }
    }
}
${PATCH_END}`;

function applyPatch(contents) {
  if (contents.includes(PATCH_START)) {
    return contents.replace(
      new RegExp(`${PATCH_START}[\\s\\S]*?${PATCH_END}`),
      PATCH,
    );
  }

  const anchor = "\n// Apply static values from `gradle.properties` to the `android.packagingOptions`";
  if (!contents.includes(anchor)) {
    throw new Error("Could not find android packagingOptions anchor in app/build.gradle");
  }

  return contents.replace(anchor, `\n${PATCH}\n${anchor}`);
}

module.exports = function withMpvLibcxx(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== "groovy") {
      throw new Error("withMpvLibcxx only supports Groovy app/build.gradle files");
    }

    config.modResults.contents = applyPatch(config.modResults.contents);
    return config;
  });
};
